export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  year: number;
  month: number;
}

export interface Bill {
  dueDate: string;
  description: string;
  amount: number;
  year: number;
  month: number;
}

export interface Income extends Transaction {}

export interface GroceryItem extends Transaction {
  estimatedNextAmount: number;
  store: string;
}

