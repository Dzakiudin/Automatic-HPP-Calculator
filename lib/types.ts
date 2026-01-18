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
