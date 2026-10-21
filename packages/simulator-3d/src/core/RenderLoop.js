export function startRenderLoop(frame) {
  let active = true;
  let id = 0;
  function loop(time) {
    if (!active) return;
    frame(time);
    id = requestAnimationFrame(loop);
  }
  id = requestAnimationFrame(loop);
  return () => { active = false; cancelAnimationFrame(id); };
}
