/** Hit regions measured on the user-supplied 8784x4215 SVG, normalized to 1800 wide. */
export const CAB_VIEWBOX=Object.freeze({x:0,y:0,width:1800,height:863.7295081967});
export const MASTER_POSITIONS=Object.freeze(['EB','B7','B6','B5','B4','B3','B2','B1','N','P1','P2','P3','P4']);
export const DISPLAY_DETENTS=Object.freeze([...MASTER_POSITIONS].reverse());
export const circle=(cx,cy,r)=>({kind:'circle',cx,cy,r});
export const rect=(x,y,w,h,rx=3)=>({kind:'rect',x,y,w,h,rx});
export const polygon=points=>({kind:'polygon',points});
const part=(id,label,description,group,shape,command=null,value=null)=>({id,label,description,group,shape,command,value});
export const CAB_PARTS=Object.freeze([
 part('leftConsole','Left Console','Communication equipment and left desk panel.','Cab Structure',polygon([[5,130],[594,4],[724,296],[150,394]])),
 part('centerConsole','Front Display Panel','Air brake gauges, speedometer and indicator lamps.','Cab Structure',polygon([[597,3],[1197,3],[1093,304],[720,303]])),
 part('rightConsole','Right Console','Train Management System and auxiliary controls.','Cab Structure',polygon([[1200,3],[1793,130],[1645,390],[1091,305]])),
 part('tms','Train Management System (TMS)','Live train and passenger-door monitoring display. Upper door row: left. Lower door row: right.','Displays',polygon([[1223,58],[1517,102],[1454,335],[1155,290]])),
 part('brakeCylinder','Brake Cylinder Pressure Gauge','Shows brake cylinder pressure in kPa.','Instruments',circle(707,68,41)),
 part('brakePipe','Brake Pipe Pressure Gauge','Shows brake pipe pressure in kPa.','Instruments',circle(801,68,41)),
 part('speedometer','Speedometer','Shows speed of the train in kilometres per hour.','Instruments',circle(930,69,42)),
 part('radio','Train Protection Radio','Controls train radio power, test and emergency calls.','Communications',polygon([[50,128],[250,108],[352,331],[140,369]])),
 part('radioPower','Radio Power','Radio power button.','Communications',circle(112,189,23)),
 part('radioEmergency','Radio Emergency','Emergency radio call; not emergency braking.','Communications',circle(174,176,23)),
 part('radioTest','Radio Test','Radio self-test button.','Communications',circle(231,173,23)),
 part('radioOCC','OCC Radio','Operations Control Centre communication.','Communications',circle(160,262,21)),
 part('radioWayside','Wayside Radio','Wayside communication.','Communications',circle(216,250,22)),
 part('radioInterrupt','Radio Interrupt','Interrupt radio call.','Communications',circle(268,243,23)),
 part('pa','Public Address Microphone','Microphone for announcements.','Communications',rect(322,145,92,110)),
 part('passengerCall','Passenger Emergency Call Handset','Passenger emergency telephone.','Communications',rect(409,112,122,190)),
 part('trainRadio','Train Radio Handset','Driver train radio telephone.','Communications',rect(522,98,122,202)),
 part('voltage','Traction Voltage Meter','Displays traction voltage in kV.','Instruments',rect(754,201,45,57)),
 part('current','Traction Current Meter','Displays traction current in kA.','Instruments',rect(814,203,46,57)),
 part('allDoorsOpenLamp','All Doors Open Indicator','Illuminates when either door bank is open.','Indicators',circle(1033,52,25)),
 part('allDoorsClosedLamp','All Doors Closed Indicator','Illuminates only when all passenger doors are closed and locked.','Indicators',circle(1111,53,26)),
 part('remoteBrake','Remote Emergency Brake Indication','Emergency brake indication.','Indicators',rect(900,222,58,54)),
 part('departureAuthorize','Departure Authorization Indicator','Displayed only when authorization state is available.','Indicators',rect(955,222,55,54)),
 part('stationStop','Station Stop Indicator','Displayed only when station stop state is available.','Indicators',rect(1009,222,55,54)),
 part('bypass','Bypass and Rescue Switches','MR, DSD, TCMS, ADC, ZS and ATP bypass switch panel.','Auxiliary',rect(162,420,140,277)),
 part('auxiliary','Auxiliary Switch Panel','Battery, pantograph, lights, parking brake and electric brake controls.','Auxiliary',polygon([[1525,109],[1741,136],[1642,361],[1476,335]])),
 part('cabSelector','Cab Selection Knob','Select active cab.','Driving Desk',circle(672,337,25)),
 part('horn','Horn Button','Driver audible warning.','Driving Desk',circle(737,383,26)),
 part('masterHandle','Master Control Handle','Thirteen-position master handle from P4 through EB.','Driving Desk',rect(800,318,92,166),'MASTER_HANDLE_SET'),
 part('vigilanceButton','Vigilance Acknowledge Button','Acknowledges the vigilance warning; the button is positioned near the master handle.','Driving Desk',circle(954,436,29),'VIGILANCE_ACKNOWLEDGE'),
 part('reverser','Reversing Handle','Forward / neutral / reverse direction control.','Driving Desk',rect(998,321,61,166)),
 part('driverKey','Driver Key','Driver authorization key switch.','Driving Desk',circle(1114,345,25)),
 part('modeSelector','Mode Selector Knob','Operating mode selector.','Driving Desk',circle(1187,346,26)),
 part('securityBrake','Security Brake','Separate security-brake pushbutton; applies emergency braking.','Driving Desk',circle(1269,366,30),'EMERGENCY_BRAKE_ACTIVATE'),
 part('leftDoors','Left Door Controls','Enable, open and close left-side doors.','Passenger Doors',polygon([[441,408],[648,409],[615,489],[418,488]])),
 part('rightDoors','Right Door Controls','Enable, open and close right-side doors.','Passenger Doors',polygon([[1118,411],[1317,414],[1383,491],[1151,492]])),
 part('leftDoorClose','Left Doors — CLOSE','Commands the left bank closed.','Passenger Doors',circle(480,439,24),'DOOR_CLOSE_REQUEST','LEFT'),
 part('leftDoorOpen','Left Doors — OPEN','Opens enabled left-side doors.','Passenger Doors',circle(537,440,24),'DOOR_OPEN_REQUEST','LEFT'),
 part('leftDoorEnable','Left Doors — ENABLE','Authorizes left-side passenger door opening while stopped.','Passenger Doors',circle(595,440,25),'DOOR_ENABLE_SET','LEFT'),
 part('rightDoorEnable','Right Doors — ENABLE','Authorizes right-side passenger door opening while stopped.','Passenger Doors',circle(1185,442,25),'DOOR_ENABLE_SET','RIGHT'),
 part('rightDoorOpen','Right Doors — OPEN','Opens enabled right-side doors.','Passenger Doors',circle(1248,440,25),'DOOR_OPEN_REQUEST','RIGHT'),
 part('rightDoorClose','Right Doors — CLOSE','Commands right-side doors closed.','Passenger Doors',circle(1309,440,25),'DOOR_CLOSE_REQUEST','RIGHT'),
 part('emergencyRelease','Emergency Brake Release (TMS)','Releases the stopped train emergency braking after a 3-second simulated pneumatic release. No separate reset pushbutton.','Safety',rect(1390,245,98,32),'EMERGENCY_BRAKE_RELEASE'),
 part('storage','Storage Cabinet','Cab equipment storage.','Cab Structure',polygon([[310,520],[715,514],[710,800],[310,810]])),
 part('breakers','Circuit Breaker Panel','Electrical protective breaker enclosure.','Cab Structure',polygon([[1110,514],[1598,514],[1594,815],[1101,817]])),
]);
export const PART_BY_ID=Object.freeze(Object.fromEntries(CAB_PARTS.map(p=>[p.id,p])));
export const CAB_GROUPS=Object.freeze([...new Set(CAB_PARTS.map(p=>p.group))]);
