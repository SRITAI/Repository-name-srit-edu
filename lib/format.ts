export function formatPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}
