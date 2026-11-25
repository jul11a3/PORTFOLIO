// Local wall-clock boundaries. Construct the next date locally so daylight-saving
// changes do not assume that every calendar day is exactly 24 hours long.
export function automaticTheme(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 1110 || minutes < 360 ? 'dark' : 'light';
}
export function nextThemeBoundary(now = new Date()) {
  const next = new Date(now);
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < 360) next.setHours(6, 0, 0, 0);
  else if (minutes < 1110) next.setHours(18, 30, 0, 0);
  else { next.setDate(next.getDate() + 1); next.setHours(6, 0, 0, 0); }
  return next.getTime();
}
