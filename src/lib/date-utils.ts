/**
 * Date come stringhe YYYY-MM-DD nel fuso orario LOCALE.
 * Non usare toISOString().split('T')[0]: converte in UTC e, in Italia (UTC+1/+2),
 * sposta la data al giorno precedente.
 */
export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function monthRange(year: number, monthIndex: number): { start: string; end: string } {
  return {
    start: toDateStr(new Date(year, monthIndex, 1)),
    end: toDateStr(new Date(year, monthIndex + 1, 0)),
  };
}

/** Raggruppa date YYYY-MM-DD in intervalli di giorni consecutivi. */
export function groupContiguousDates(dates: string[]): { start: string; end: string }[] {
  const sorted = [...new Set(dates)].sort();
  const ranges: { start: string; end: string }[] = [];
  let startStr: string | null = null;
  let prev: Date | null = null;
  let prevStr = '';
  for (const s of sorted) {
    const [y, m, d] = s.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    if (startStr && prev) {
      const next = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
      if (toDateStr(next) !== s) {
        ranges.push({ start: startStr, end: prevStr });
        startStr = s;
      }
    } else {
      startStr = s;
    }
    prev = cur;
    prevStr = s;
  }
  if (startStr) ranges.push({ start: startStr, end: prevStr });
  return ranges;
}
