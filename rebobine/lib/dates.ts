/**
 * Datas sempre em fuso America/Sao_Paulo.
 */

const TIMEZONE = 'America/Sao_Paulo';

export function agora(): Date {
  return new Date();
}

export function hoje(): Date {
  const d = new Date();
  return new Date(d.toLocaleString('en-US', { timeZone: TIMEZONE }));
}

export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return '';
  const d = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatarDataHora(data: Date | string | null | undefined): string {
  if (!data) return '';
  const d = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function diasEntre(data1: Date | string, data2: Date | string): number {
  const d1 = typeof data1 === 'string' ? new Date(data1) : data1;
  const d2 = typeof data2 === 'string' ? new Date(data2) : data2;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((d2.getTime() - d1.getTime()) / msPerDay);
}

export function somarDias(data: Date | string, dias: number): Date {
  const d = typeof data === 'string' ? new Date(data) : data;
  const resultado = new Date(d);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}
