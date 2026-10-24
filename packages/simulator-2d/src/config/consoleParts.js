/**
 * Interaction map calibrated against the original TRAINEX-Driver-Cab-2D.svg.
 * The original artwork is never edited. Coordinates are SVG viewBox units,
 * not CSS pixels or guessed percentages.
 *
 * When replacing an SVG with a DIFFERENT component layout, calibrate these
 * shapes in one place. Replacement SVGs with this layout need no changes.
 */
export const CAB_VIEWBOX = Object.freeze({x:0,y:0,width:1540,height:798});
export const MASTER_POSITIONS = Object.freeze(['EB','B3','B2','B1','N','P1','P2','P3']);
export const DISPLAY_DETENTS = Object.freeze([...MASTER_POSITIONS].reverse());

export const circle=(cx,cy,r)=>({kind:'circle',cx,cy,r});
export const rect=(x,y,w,h,rx=3)=>({kind:'rect',x,y,w,h,rx});
export const polygon=(points)=>({kind:'polygon',points});
export const path=(d)=>({kind:'path',d});

const part=(id,label,description,group,shape,command=null)=>({id,label,description,group,shape,command});

// The larger inspect-only areas come first. Small active controls are later so
// they win when their hit shapes overlap a parent panel.
export const CAB_PARTS=Object.freeze([
  part('cabLeft','Left Console Housing','Angled enclosure housing communications equipment and the driver desk.','Cab Structure',polygon([[39,156],[520,52],[629,296],[158,367]])),
  part('cabCenter','Instrument Console','Central desk grouping the speedometer, brake pressure indicators and status lamps.','Cab Structure',polygon([[521,52],[1018,52],[928,294],[628,294]])),
  part('cabRight','Right Console Housing','Enclosure for the train control display and electrical auxiliary controls.','Cab Structure',polygon([[1018,52],[1498,158],[1382,368],[928,295]])),
  part('radio','Train Protection Radio','Provides communication with railway control personnel and supports train-radio functions.','Communications',polygon([[79,174],[246,140],[335,326],[164,353]])),
  part('pa','Public Address Microphone','Allows the driver to make public-address announcements to passengers.','Communications',polygon([[282,210],[306,199],[332,208],[352,249],[318,255]])),
  part('passengerCall','Passenger Emergency Call Handset','Provides two-way communication for passenger emergency calls.','Communications',polygon([[350,135],[433,116],[484,276],[398,296]])),
  part('trainRadio','Train Radio Handset','Allows the driver to communicate with railway control centres and operating personnel.','Communications',polygon([[428,120],[516,98],[581,280],[491,296]])),
  part('brakeCylinder','Brake Cylinder Gauge','Displays the air pressure applied to the brake cylinders, indicating the braking force being produced.','Instruments',circle(619,107,31)),
  part('brakePipe','Brake Pipe Gauge','Displays air pressure in the train brake pipe, a key indication for pneumatic braking.','Instruments',circle(695,107,31)),
  part('speedometer','Speedometer','Displays the train’s current speed in kilometres per hour.','Instruments',circle(780,107,33)),
  part('brakeBar','Brake Pressure Display','A vertical pressure indication on the driver console.','Instruments',rect(633,165,70,114)),
  part('tractionVoltage','Traction Voltage Meter','Indicates electrical voltage supplied to the traction equipment.','Instruments',rect(732,179,44,93)),
  part('tractionCurrent','Traction Current Meter','Indicates current drawn by the traction equipment.','Instruments',rect(782,179,44,93)),
  part('allDoorsClosedLamp','All Doors Closed Indicator','Illuminates when all passenger doors are confirmed closed and secured.','Indications',circle(872,95,20)),
  part('vigilanceLamp','Vigilance Indicator','Provides a visual indication associated with the driver vigilance system.','Indications',circle(946,95,18)),
  part('remoteEmergencyLamp','Remote Emergency Brake Indication','Status light used for remote emergency brake functions on compatible trains.','Indications',rect(841,135,42,39)),
  part('departureAuthorizedLamp','Departure Authorized Lamp','Indicates departure authorization when provided by the train operating and signalling systems.','Indications',rect(881,135,44,39)),
  part('stationStopLamp','Station Stop Indication','Indicates a station-stop condition on applicable control systems.','Indications',rect(922,135,43,39)),
  part('tcms','Driver Display / TCMS','Train Control and Monitoring System display showing train operating and fault information.','Instruments',polygon([[1043,97],[1275,130],[1217,306],[981,271]])),
  part('electricButtons','Electrical Buttons BN / BF / PU','Electrical control buttons associated with battery and pantograph operation.','Auxiliary',polygon([[1293,139],[1450,164],[1455,196],[1285,175]])),
  part('releaseSwitches','HL / TL / PB / EB Switches','Controls for head lights (HL), tail lights (TL), parking brake (PB), and electric brake (EB).','Auxiliary',polygon([[1295,192],[1400,214],[1360,348],[1251,325]])),
  part('cabSelector','Cab Selector','Used to select the controlling cab on trains with multiple driver cabs.','Driving Desk',circle(589,327,19)),
  part('masterHandle','Master Control Handle','Selects eight positions: EB, B3, B2, B1, N, P1, P2 and P3.','Driving Desk',rect(653,316,45,123),'MASTER_HANDLE_SET'),
  part('horn','Horn Button','Operates the train horn to provide an audible warning.','Driving Desk',circle(589,406,26)),
  part('vigilanceButton','Vigilance Acknowledgement','Allows the driver to acknowledge vigilance-system prompts.','Driving Desk',circle(776,404,24)),
  part('reverser','Reverser Handle','Selects the intended direction of travel: forward, neutral, or reverse.','Driving Desk',rect(840,317,46,124)),
  part('driverKey','Driver Key','Activates cab control systems on applicable rolling stock.','Driving Desk',circle(919,332,22)),
  part('modeSelector','Mode Selector','Selects the applicable train operating mode.','Driving Desk',circle(992,330,22)),
  part('emergencyBrake','Emergency Brake Button','Requests emergency braking and stays active until the reset conditions are met.','Driving Desk',circle(1076,346,27),'EMERGENCY_BRAKE_ACTIVATE'),
  part('leftDoorBank','Left Passenger Door Controls','The left-side door control group: Open, Lock and Close.','Passenger Doors',polygon([[374,378],[545,379],[525,447],[346,447]])),
  part('rightDoorBank','Right Passenger Door Controls','The right-side door control group: Open, Lock and Close.','Passenger Doors',polygon([[995,385],[1162,384],[1200,450],[1033,452]])),
  part('bypassSwitches','Bypass Switch Bank','Bypass/rescue switches for the main reservoir (MR), driver safety device (DSD), train control and monitoring system (TCMS), all-doors-closed circuit (ADC), zero-speed circuit (ZS), and automatic train protection (ATP).','Auxiliary',polygon([[183,402],[292,386],[292,591],[183,607]])),
  part('storage','Storage Cabinet','Equipment compartment below the left side of the driver desk.','Cab Structure',polygon([[350,475],[612,461],[610,667],[350,674]])),
  part('circuitBreakers','Circuit Breaker Panel','Electrical protective breaker enclosure below the right console.','Cab Structure',polygon([[961,467],[1358,423],[1358,717],[963,678]])),

  // Precise children are ABOVE their parent inspection areas.
  part('radioPower','Radio Power','Power control/indication on the radio unit.','Communications',circle(137,215,17)),
  part('radioEmergency','Radio Emergency','Radio emergency communication function; not the emergency brake.','Communications',circle(188,202,18)),
  part('radioTest','Radio Test','Radio subsystem test control.','Communications',circle(235,197,18)),
  part('radioOCC','OCC Radio Selection','Communication selection for the operations control centre.','Communications',circle(167,262,18)),
  part('radioWayside','Wayside Radio Selection','Communication selection for wayside equipment or personnel.','Communications',circle(212,253,18)),
  part('radioInterrupt','Radio Interrupt','Controls the radio interruption function.','Communications',circle(261,244,18)),
  part('radioStatus','Radio Status Display','Shows radio-related indications.','Communications',polygon([[169,296],[292,271],[308,317],[183,342]])),
  part('leftDoorOpen','Left Doors — Open','Requests passenger-door opening, subject to the engine interlocks.','Passenger Doors',circle(394,404,20),'DOOR_OPEN_REQUEST'),
  part('leftDoorLock','Left Doors — Lock','Used to secure the left-side passenger doors in the locked condition.','Passenger Doors',circle(448,402,20)),
  part('leftDoorClose','Left Doors — Close','Requests passenger-door closing; the closed lamp follows actual door state.','Passenger Doors',circle(506,403,20),'DOOR_CLOSE_REQUEST'),
  part('rightDoorOpen','Right Doors — Open','Requests passenger-door opening through the central Input Manager.','Passenger Doors',circle(1045,407,21),'DOOR_OPEN_REQUEST'),
  part('rightDoorLock','Right Doors — Lock','Used to secure the right-side passenger doors in the locked condition.','Passenger Doors',circle(1104,407,20)),
  part('rightDoorClose','Right Doors — Close','Requests passenger-door closing through the central Input Manager.','Passenger Doors',circle(1153,408,20),'DOOR_CLOSE_REQUEST'),
]);
export const PART_BY_ID=Object.freeze(Object.fromEntries(CAB_PARTS.map(p=>[p.id,p])));
export const CAB_GROUPS=Object.freeze([...new Set(CAB_PARTS.map(p=>p.group))]);
