export interface Transaction {
  date: string;
  description: string;
  amount: string;
  type: "credit" | "debit";
}

export interface StatementData {
  transactions: Transaction[];
}

export interface PagePreviews {
  [pageNum: number]: string | null;
}

export interface PageSelection {
  fileId: string;
  numPages: number;
  selectedPages: number[];
  previews: PagePreviews;
}

export interface DrawingData {
  type: "rect";
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}
