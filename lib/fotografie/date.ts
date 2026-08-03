export function formatBelgianDate(value: string | Date): string {
  return new Intl.DateTimeFormat('nl-BE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(value));
}
