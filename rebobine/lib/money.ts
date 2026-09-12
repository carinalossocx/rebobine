/**
 * Dinheiro sempre em centavos inteiros.
 * R$ 10,00 = 1000
 * R$ 2,50 = 250
 */

export function centavosToReais(centavos: number | null | undefined): number {
  if (centavos == null) return 0;
  return centavos / 100;
}

export function formatarReais(centavos: number | null | undefined): string {
  if (centavos == null) return 'R$ 0,00';
  const reais = centavosToReais(centavos);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

export function reaisToCentavos(reais: number): number {
  return Math.round(reais * 100);
}
