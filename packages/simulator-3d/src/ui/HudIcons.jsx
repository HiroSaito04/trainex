const ICONS={
 play:<path d="M8 5.5 19 12 8 18.5z" fill="currentColor" stroke="none"/>,
 pause:<><rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/></>,
 reset:<><path d="M3.5 10a9 9 0 1 1 .9 6.3"/><path d="M3.5 4v6h6"/></>,
 end:<rect x="6.5" y="6.5" width="11" height="11" rx="1" fill="currentColor" stroke="none"/>,
 expand:<><path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5"/></>,
 collapse:<><path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5"/></>,
 up:<path d="m6 15 6-6 6 6"/>,
 down:<path d="m6 9 6 6 6-6"/>,
 left:<path d="m15 6-6 6 6 6"/>,
 right:<path d="m9 6 6 6-6 6"/>,
 eye:<><path d="M2 12s3.7-6.5 10-6.5S22 12 22 12s-3.7 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.8"/></>,
};
export default function HudIcon({name}){
 return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONS[name]??ICONS.eye}</svg>;
}
