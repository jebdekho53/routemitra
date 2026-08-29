export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatPrice(inr: number): string {
  return `₹${inr.toLocaleString("en-IN")}`;
}
