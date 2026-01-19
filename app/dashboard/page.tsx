"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { MobileLayout, MobileCard, MobileSectionHeader } from "@/components/mobile-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Megaphone,
  ShoppingCart,
  Loader2,
  Check,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Transaction, TransactionType, ExpenseCategory, IncomeCategory } from "@/lib/types";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  calculateSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  formatRupiah,
} from "@/lib/dashboard-store";
import { useToast } from "@/hooks/use-toast";

type PeriodFilter = "bulan-ini" | "bulan-lalu" | "tahun-ini";
type TransactionFilter = "semua" | "pemasukan" | "pengeluaran";

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: "biaya-iklan", label: "Biaya Iklan" },
  { value: "biaya-operasional", label: "Biaya Operasional" },
  { value: "gaji-karyawan", label: "Gaji Karyawan" },
  { value: "bahan-baku", label: "Bahan Baku" },
  { value: "sewa-tempat", label: "Sewa Tempat" },
  { value: "utilitas", label: "Utilitas" },
  { value: "pemasaran", label: "Pemasaran" },
  { value: "administrasi", label: "Administrasi" },
  { value: "lainnya", label: "Lainnya" },
];

const incomeCategories: { value: IncomeCategory; label: string }[] = [
  { value: "penjualan-produk", label: "Penjualan Produk" },
  { value: "penjualan-jasa", label: "Penjualan Jasa" },
  { value: "pendapatan-lain", label: "Pendapatan Lain" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("bulan-ini");
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>("semua");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form state
  const [formType, setFormType] = useState<TransactionType>("expense");
  const [formCategory, setFormCategory] = useState<string>("biaya-iklan");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const { startDate, endDate, previousStartDate, previousEndDate, dateRangeLabel } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;
    let prevStart: Date;
    let prevEnd: Date;
    let label: string;

    if (periodFilter === "bulan-ini") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      label = `${getMonthName(now.getMonth())} ${now.getFullYear()}`;
    } else if (periodFilter === "bulan-lalu") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      label = `${getMonthName(now.getMonth() - 1)} ${now.getFullYear()}`;
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31);
      label = `Tahun ${now.getFullYear()}`;
    }

    return {
      startDate: start,
      endDate: end,
      previousStartDate: prevStart,
      previousEndDate: prevEnd,
      dateRangeLabel: label,
    };
  }, [periodFilter]);

  const summary = useMemo(() => {
    return calculateSummary(transactions, startDate, endDate, previousStartDate, previousEndDate);
  }, [transactions, startDate, endDate, previousStartDate, previousEndDate]);

  const monthlyTrends = useMemo(() => {
    return getMonthlyTrends(transactions);
  }, [transactions]);

  const expenseBreakdown = useMemo(() => {
    const filtered = transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );
    return getCategoryBreakdown(filtered, "expense");
  }, [transactions, startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );

    if (transactionFilter === "pemasukan") {
      filtered = filtered.filter((t) => t.type === "income");
    } else if (transactionFilter === "pengeluaran") {
      filtered = filtered.filter((t) => t.type === "expense");
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, startDate, endDate, transactionFilter]);

  const groupedTransactions = useMemo(() => {
    const groups: Map<string, Transaction[]> = new Map();

    filteredTransactions.forEach((t) => {
      const dateKey = formatDateGroup(t.date);
      const existing = groups.get(dateKey) || [];
      existing.push(t);
      groups.set(dateKey, existing);
    });

    return Array.from(groups.entries());
  }, [filteredTransactions]);

  function getMonthName(month: number): string {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return months[month < 0 ? month + 12 : month];
  }

  function formatDateGroup(date: Date): string {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  }

  function resetForm() {
    setFormType("expense");
    setFormCategory("biaya-iklan");
    setFormDescription("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormNotes("");
    setEditingTransaction(null);
  }

  function handleSubmit() {
    const amount = parseFloat(formAmount.replace(/\D/g, ""));
    if (!amount || !formDescription) {
      toast({
        title: "Data tidak lengkap",
        variant: "destructive",
      });
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type: formType,
        category: formCategory as ExpenseCategory | IncomeCategory,
        description: formDescription,
        amount,
        date: new Date(formDate),
        notes: formNotes,
      });
      toast({ title: "Transaksi diperbarui" });
    } else {
      addTransaction({
        type: formType,
        category: formCategory as ExpenseCategory | IncomeCategory,
        description: formDescription,
        amount,
        date: new Date(formDate),
        notes: formNotes,
      });
      toast({ title: "Transaksi ditambahkan" });
    }

    setTransactions(getTransactions());
    setIsAddSheetOpen(false);
    resetForm();
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setFormCategory(transaction.category);
    setFormDescription(transaction.description);
    setFormAmount(transaction.amount.toString());
    setFormDate(transaction.date.toISOString().split("T")[0]);
    setFormNotes(transaction.notes || "");
    setIsAddSheetOpen(true);
  }

  function handleDelete(id: string) {
    deleteTransaction(id);
    setTransactions(getTransactions());
    toast({ title: "Transaksi dihapus" });
  }

  if (loading) {
    return (
      <MobileLayout title="Dashboard Keuangan">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MobileLayout title="Dashboard Keuangan">
      {/* Period Filter */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {[
            { value: "bulan-ini" as PeriodFilter, label: "Bulan Ini" },
            { value: "bulan-lalu" as PeriodFilter, label: "Bulan Lalu" },
            { value: "tahun-ini" as PeriodFilter, label: "Tahun Ini" },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setPeriodFilter(period.value)}
              className={cn(
                "h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                periodFilter === period.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground active:bg-muted/80"
              )}
            >
              {period.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5" />
            {dateRangeLabel}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-3 space-y-3">
        {/* Income & Expense Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Pemasukan</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-lg font-bold">{formatRupiah(summary.totalIncome)}</p>
            <div className="flex items-center gap-1 mt-1">
              {summary.incomeChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-primary" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={cn(
                "text-xs",
                summary.incomeChange >= 0 ? "text-primary" : "text-destructive"
              )}>
                {summary.incomeChange >= 0 ? "+" : ""}{summary.incomeChange.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Pengeluaran</span>
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <p className="text-lg font-bold">{formatRupiah(summary.totalExpense)}</p>
            <div className="flex items-center gap-1 mt-1">
              {summary.expenseChange <= 0 ? (
                <TrendingDown className="h-3 w-3 text-primary" />
              ) : (
                <TrendingUp className="h-3 w-3 text-destructive" />
              )}
              <span className={cn(
                "text-xs",
                summary.expenseChange <= 0 ? "text-primary" : "text-destructive"
              )}>
                {summary.expenseChange >= 0 ? "+" : ""}{summary.expenseChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-foreground/80">Saldo Saat Ini</p>
              <p className="text-2xl font-bold mt-1">{formatRupiah(summary.balance)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="px-4 py-3 grid grid-cols-3 gap-3">
        {/* Trend Chart */}
        <div className="col-span-2 bg-card rounded-2xl p-3 border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Tren Cashflow</p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends.slice(-3)}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#22c55e" }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card rounded-2xl p-3 border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Kategori</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown.slice(0, 4)}
                  cx="50%"
                  cy="50%"
                  innerRadius={18}
                  outerRadius={35}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {expenseBreakdown.slice(0, 4).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Filter */}
      <MobileSectionHeader title="Riwayat Transaksi" />
      <div className="px-4 pb-2">
        <div className="flex gap-2">
          {[
            { value: "semua" as TransactionFilter, label: "Semua" },
            { value: "pemasukan" as TransactionFilter, label: "Masuk" },
            { value: "pengeluaran" as TransactionFilter, label: "Keluar" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTransactionFilter(filter.value)}
              className={cn(
                "h-8 px-4 rounded-full text-sm font-medium transition-colors",
                transactionFilter === filter.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground active:bg-muted/80"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4 pb-24 space-y-4">
        {groupedTransactions.map(([dateGroup, items]) => (
          <div key={dateGroup}>
            <p className="text-xs font-medium text-muted-foreground mb-2">{dateGroup}</p>
            <div className="bg-card rounded-2xl border overflow-hidden divide-y">
              {items.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-4 active:bg-muted/50"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      transaction.type === "income"
                        ? "bg-primary/10"
                        : "bg-destructive/10"
                    )}
                  >
                    {transaction.type === "income" ? (
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    ) : (
                      <Megaphone className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {transaction.notes || transaction.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-semibold",
                        transaction.type === "income" ? "text-primary" : "text-destructive"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatRupiah(transaction.amount)}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground active:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-destructive active:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {groupedTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada transaksi</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          resetForm();
          setIsAddSheetOpen(true);
        }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add/Edit Transaction Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-3 border-b">
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-3" />
              <SheetTitle className="text-left">
                {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setFormType("income");
                    setFormCategory("penjualan-produk");
                  }}
                  className={cn(
                    "h-14 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all",
                    formType === "income"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border active:scale-[0.98]"
                  )}
                >
                  <TrendingUp className="h-5 w-5" />
                  Pemasukan
                  {formType === "income" && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setFormType("expense");
                    setFormCategory("biaya-iklan");
                  }}
                  className={cn(
                    "h-14 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all",
                    formType === "expense"
                      ? "border-destructive bg-destructive/5 text-destructive"
                      : "border-border active:scale-[0.98]"
                  )}
                >
                  <TrendingDown className="h-5 w-5" />
                  Pengeluaran
                  {formType === "expense" && <Check className="h-4 w-4" />}
                </button>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(formType === "income" ? incomeCategories : expenseCategories).map(
                      (cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <Input
                  placeholder="Contoh: Penjualan hari ini"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="h-12 rounded-xl pl-12 text-lg font-semibold"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan (opsional)</label>
                <Input
                  placeholder="Catatan tambahan"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t safe-padding-bottom">
              <button
                onClick={handleSubmit}
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                {editingTransaction ? "Simpan Perubahan" : "Tambah Transaksi"}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
