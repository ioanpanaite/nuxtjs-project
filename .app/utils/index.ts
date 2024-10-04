
export function getFormatDate(dateVal: any) {
  const dd = new Date(dateVal).getDate()
  const yy = new Date(dateVal).getFullYear()
  const mm = (new Date(dateVal).getMonth() + 1)
  const formattedDate = `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;

  return formattedDate
}