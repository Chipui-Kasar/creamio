/** Feet-and-inches formatting, e.g. 4.3 → 4′ 4″ (rounded to the nearest inch). */
export function ftIn(feet: number): string {
  const totalIn = Math.round(Math.abs(feet) * 12);
  const f = Math.floor(totalIn / 12);
  const i = totalIn % 12;
  const sign = feet < 0 ? "−" : "";
  return i === 0 ? `${sign}${f}′` : f === 0 ? `${sign}${i}″` : `${sign}${f}′ ${i}″`;
}
