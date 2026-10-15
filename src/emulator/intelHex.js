
export function parseIntelHex(
  source,
  flashBytes = 65536
) {
  const memory = new Uint8Array(flashBytes);
  memory.fill(0xff);

  let addressOffset = 0;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) continue;

    if (
      !/^:([0-9A-Fa-f]{2})+$/.test(line)
    ) {
      throw new Error("Invalid Intel HEX record");
    }

    const data = [];

    for (let i = 1; i < line.length; i += 2) {
      data.push(parseInt(line.slice(i, i + 2), 16));
    }

    const count = data[0];
    const address = (data[1] << 8) | data[2];
    const type = data[3];

    if (data.length !== count + 5) {
      throw new Error("Incorrect HEX record length");
    }

    const checksum =
      data.reduce((sum, n) => sum + n, 0) & 255;

    if (checksum !== 0) {
      throw new Error("Invalid HEX checksum");
    }

    if (type === 0x01) break;

    if (type === 0x04) {
      addressOffset =
        ((data[4] << 8) | data[5]) << 16;
      continue;
    }

    if (type === 0x02) {
      addressOffset =
        ((data[4] << 8) | data[5]) << 4;
      continue;
    }

    if (type === 0x03 || type === 0x05) {
      continue;
    }

    if (type !== 0x00) {
      throw new Error(`Unknown HEX record type ${type}`);
    }

    const destination = addressOffset + address;

    if (destination + count > flashBytes) {
      throw new Error("Firmware exceeds flash memory");
    }

    memory.set(
      data.slice(4, 4 + count),
      destination
    );
  }

  // AVR instructions are read as 16-bit words.
  return new Uint16Array(memory.buffer);
}
