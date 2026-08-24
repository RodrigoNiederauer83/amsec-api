export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function extractCentsFromInput(rawValue: string): number | null {
  const digits = rawValue.replace(/\D/g, "");
  if (!digits) return null;
  return parseInt(digits, 10);
}