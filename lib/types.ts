export type BusinessMode = 
  | 'iklan-cod'
  | 'marketplace'
  | 'ritel-fnb'
  | 'manufaktur'
  | 'produksi-turunan'
  | 'jasa';

export type CalculationMode = 'target-produksi' | 'biaya-satuan';

export interface VariableCost {
  id: string;
  name: string;
  amount: number;
}

export interface FixedCost {
  id: string;
  name: string;
  monthlyAmount: number;
  allocationPerProduct: number;
}

export interface ProcessingCost {
  id: string;
  name: string;
  amount: number;
  period: 'per-batch' | 'per-unit';
}

export interface DerivedProduct {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  sellingPrice: number;
}

export interface HPPCalculation {
  id: string;
  productName: string;
  category: string;
  businessMode: BusinessMode;
  calculationMode: CalculationMode;
  variableCosts: VariableCost[];
  fixedCosts: FixedCost[];
  targetSalesPerMonth: number;
  totalVariableCost: number;
  totalFixedCostAllocation: number;
  hppPerProduct: number;
  createdAt: Date;
  aiRecommendations?: PriceRecommendation;
}

export interface PriceRecommendation {
  competitive: {
    price: number;
    profit: number;
    margin: number;
    description: string;
  };
  standard: {
    price: number;
    profit: number;
    margin: number;
    description: string;
  };
  premium: {
    price: number;
    profit: number;
    margin: number;
    description: string;
  };
}

export interface BundleProduct {
  id: string;
  name: string;
  normalPrice: number;
  hpp: number;
}

export interface BundleRecommendation {
  economyPack: {
    price: number;
    discount: number;
    profit: number;
    margin: number;
    description: string;
  };
  balancedPack: {
    price: number;
    discount: number;
    profit: number;
    margin: number;
    description: string;
  };
  profitMaxPack: {
    price: number;
    discount: number;
    profit: number;
    margin: number;
    description: string;
  };
}

export interface DerivedProductCalculation {
  id: string;
  businessName: string;
  batchesPerMonth: number;
  rawMaterial: {
    name: string;
    totalCost: number;
    quantity: number;
    unit: string;
  };
  processingCosts: ProcessingCost[];
  derivedProducts: DerivedProduct[];
  totalProductionCost: number;
  totalPotentialSales: number;
  projectedProfit: number;
  productHPPs: {
    productName: string;
    quantity: number;
    costAllocation: number;
    allocationPercentage: number;
    hppPerUnit: number;
  }[];
  createdAt: Date;
}

// Dashboard Types
export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'biaya-iklan'
  | 'biaya-operasional'
  | 'gaji-karyawan'
  | 'bahan-baku'
  | 'sewa-tempat'
  | 'utilitas'
  | 'pemasaran'
  | 'administrasi'
  | 'lainnya';

export type IncomeCategory =
  | 'penjualan-produk'
  | 'penjualan-jasa'
  | 'pendapatan-lain';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory;
  description: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface CashflowSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeChange: number;
  expenseChange: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}
