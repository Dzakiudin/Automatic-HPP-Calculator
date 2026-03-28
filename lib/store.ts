import type { HPPCalculation, DerivedProductCalculation } from './types';

const STORAGE_KEY = 'hpp-calculations';
const DERIVED_STORAGE_KEY = 'derived-calculations';

export function saveCalculation(calculation: HPPCalculation): void {
  if (typeof window === 'undefined') return;
  const existing = getCalculations().filter((c) => c.id !== calculation.id);
  existing.unshift(calculation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
}

export function getCalculations(): HPPCalculation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteCalculation(id: string): void {
  if (typeof window === 'undefined') return;
  const existing = getCalculations().filter((calc) => calc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function deleteAllCalculations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function saveDerivedCalculation(calculation: DerivedProductCalculation): void {
  if (typeof window === 'undefined') return;
  const existing = getDerivedCalculations().filter((c) => c.id !== calculation.id);
  existing.unshift(calculation);
  localStorage.setItem(DERIVED_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
}

export function getDerivedCalculations(): DerivedProductCalculation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(DERIVED_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteDerivedCalculation(id: string): void {
  if (typeof window === 'undefined') return;
  const existing = getDerivedCalculations().filter((calc) => calc.id !== id);
  localStorage.setItem(DERIVED_STORAGE_KEY, JSON.stringify(existing));
}

export function deleteAllDerivedCalculations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DERIVED_STORAGE_KEY);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseRupiah(value: string): number {
  return Number(value.replace(/[^0-9]/g, '')) || 0;
}

