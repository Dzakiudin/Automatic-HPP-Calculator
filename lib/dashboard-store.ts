"use client";

import type { Transaction, CashflowSummary, MonthlyTrend, CategoryBreakdown } from "./types";

const TRANSACTIONS_KEY = "hpp-calculator-transactions";

// Sample data for demo
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    type: "expense",
    category: "biaya-iklan",
    description: "Biaya Iklan",
    amount: 2387365,
    date: new Date("2025-09-03"),
    notes: "Biaya Iklan",
  },
  {
    id: "2",
    type: "income",
    category: "penjualan-produk",
    description: "Penjualan Produk",
    amount: 4479000,
    date: new Date("2025-09-03"),
    notes: "Penjualan Produk",
  },
  {
    id: "3",
    type: "expense",
    category: "biaya-iklan",
    description: "Biaya Iklan",
    amount: 2230812,
    date: new Date("2025-09-02"),
    notes: "Biaya Iklan",
  },
  {
    id: "4",
    type: "income",
    category: "penjualan-produk",
    description: "Penjualan Produk",
    amount: 4590000,
    date: new Date("2025-09-02"),
    notes: "Penjualan Produk",
  },
  {
    id: "5",
    type: "income",
    category: "penjualan-produk",
    description: "Penjualan Produk",
    amount: 1976000,
    date: new Date("2025-09-01"),
    notes: "Penjualan Produk",
  },
  {
    id: "6",
    type: "expense",
    category: "biaya-iklan",
    description: "Biaya Iklan",
    amount: 1316868,
    date: new Date("2025-09-01"),
    notes: "Biaya Iklan",
  },
  {
    id: "7",
    type: "expense",
    category: "biaya-operasional",
    description: "Biaya Operasional",
    amount: 500000,
    date: new Date("2025-08-28"),
    notes: "Listrik dan Air",
  },
  {
    id: "8",
    type: "income",
    category: "penjualan-produk",
    description: "Penjualan Produk",
    amount: 3500000,
    date: new Date("2025-08-25"),
    notes: "Penjualan Produk",
  },
];

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return sampleTransactions;
  
  const saved = localStorage.getItem(TRANSACTIONS_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    return parsed.map((t: Transaction) => ({
      ...t,
      date: new Date(t.date),
    }));
  }
  
  // Initialize with sample data
  saveTransactions(sampleTransactions);
  return sampleTransactions;
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function addTransaction(transaction: Omit<Transaction, "id">): Transaction {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  transactions.unshift(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): void {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    saveTransactions(transactions);
  }
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  saveTransactions(filtered);
}

export function calculateSummary(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
  previousStartDate: Date,
  previousEndDate: Date
): CashflowSummary {
  const currentTransactions = transactions.filter(
    (t) => t.date >= startDate && t.date <= endDate
  );
  
  const previousTransactions = transactions.filter(
    (t) => t.date >= previousStartDate && t.date <= previousEndDate
  );

  const currentIncome = currentTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const currentExpense = currentTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const previousIncome = previousTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const previousExpense = previousTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeChange = previousIncome > 0 
    ? ((currentIncome - previousIncome) / previousIncome) * 100 
    : 0;
  
  const expenseChange = previousExpense > 0 
    ? ((currentExpense - previousExpense) / previousExpense) * 100 
    : 0;

  return {
    totalIncome: currentIncome,
    totalExpense: currentExpense,
    balance: currentIncome - currentExpense,
    incomeChange,
    expenseChange,
  };
}

export function getMonthlyTrends(transactions: Transaction[]): MonthlyTrend[] {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const trends: Map<string, { income: number; expense: number }> = new Map();

  // Get last 3 months
  const now = new Date();
  for (let i = 2; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getDate().toString().padStart(2, '0')} ${monthNames[date.getMonth()]}`;
    trends.set(key, { income: 0, expense: 0 });
  }

  transactions.forEach((t) => {
    const key = `${t.date.getDate().toString().padStart(2, '0')} ${monthNames[t.date.getMonth()]}`;
    const existing = trends.get(key);
    if (existing) {
      if (t.type === "income") {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }
    }
  });

  return Array.from(trends.entries()).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
  }));
}

export function getCategoryBreakdown(transactions: Transaction[], type: "income" | "expense"): CategoryBreakdown[] {
  const categoryColors: Record<string, string> = {
    "biaya-iklan": "#22c55e",
    "biaya-operasional": "#3b82f6",
    "gaji-karyawan": "#f59e0b",
    "bahan-baku": "#ef4444",
    "sewa-tempat": "#8b5cf6",
    "utilitas": "#ec4899",
    "pemasaran": "#14b8a6",
    "administrasi": "#6366f1",
    "lainnya": "#94a3b8",
    "penjualan-produk": "#22c55e",
    "penjualan-jasa": "#3b82f6",
    "pendapatan-lain": "#f59e0b",
  };

  const categoryLabels: Record<string, string> = {
    "biaya-iklan": "Biaya Iklan",
    "biaya-operasional": "Biaya Operasional",
    "gaji-karyawan": "Gaji Karyawan",
    "bahan-baku": "Bahan Baku",
    "sewa-tempat": "Sewa Tempat",
    "utilitas": "Utilitas",
    "pemasaran": "Pemasaran",
    "administrasi": "Administrasi",
    "lainnya": "Lainnya",
    "penjualan-produk": "Penjualan Produk",
    "penjualan-jasa": "Penjualan Jasa",
    "pendapatan-lain": "Pendapatan Lain",
  };

  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);
  
  const breakdown: Map<string, number> = new Map();
  filtered.forEach((t) => {
    const current = breakdown.get(t.category) || 0;
    breakdown.set(t.category, current + t.amount);
  });

  return Array.from(breakdown.entries())
    .map(([category, amount]) => ({
      category: categoryLabels[category] || category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: categoryColors[category] || "#94a3b8",
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("IDR", "Rp");
}

export function formatShortRupiah(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}M`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}jt`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}rb`;
  }
  return amount.toString();
}
