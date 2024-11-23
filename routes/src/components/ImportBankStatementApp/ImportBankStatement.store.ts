import { create } from "zustand";
import {
  PagePreviews,
  PageSelection,
  StatementData,
} from "./ImportBankStatement.types";

interface ImportBankStatementState {
  file: File | null;
  pageSelection: PageSelection | null;
  statement: StatementData | null;
  error: string;
  isLoading: boolean;
  rowSelection: Record<string, boolean>;
  previewsLoading: boolean;
  isDrawingMode: boolean;
  selectedPageForDrawing: number | null;

  // Actions
  setFile: (file: File | null) => void;
  setPageSelection: (pageSelection: PageSelection | null) => void;
  setPagePreviews: (pagePreviews: PagePreviews) => void;
  togglePageSelection: (pageNum: number) => void;
  updatePagePreview: (pageNum: number, previewUrl: string) => void;
  setStatement: (statement: StatementData | null) => void;
  setError: (error: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setRowSelection: (rowSelection: Record<string, boolean>) => void;
  setPreviewsLoading: (previewsLoading: boolean) => void;
  setIsDrawingMode: (isDrawingMode: boolean) => void;
  setSelectedPageForDrawing: (selectedPageForDrawing: number | null) => void;
}

const importBankStatementStore = create<ImportBankStatementState>((set) => ({
  // State
  file: null,
  pageSelection: null,
  statement: null,
  error: "",
  isLoading: false,
  rowSelection: {},
  previewsLoading: false,
  isDrawingMode: false,
  selectedPageForDrawing: null,

  // Actions
  setFile: (file) => set({ file }),

  setPageSelection: (pageSelection) => {
    if (!pageSelection) return;

    set((state) => {
      return {
        ...state,
        pageSelection: {
          ...state.pageSelection,
          ...pageSelection,
        },
      };
    });
  },

  setPagePreviews: (pagePreviews: PagePreviews) => {
    if (!pagePreviews) return;

    set((state) => {
      if (!state.pageSelection) return state;

      console.log("Setting page previews to", pagePreviews);

      return {
        ...state,
        pageSelection: {
          ...state.pageSelection,
          previews: {
            ...state.pageSelection?.previews,
            ...pagePreviews,
          },
        },
      };
    });
  },

  togglePageSelection: (pageNum) =>
    set((state) => {
      if (!state.pageSelection) return state;

      const selectedPages = state.pageSelection.selectedPages.includes(pageNum)
        ? state.pageSelection.selectedPages.filter((p) => p !== pageNum)
        : [...state.pageSelection.selectedPages, pageNum];

      return {
        pageSelection: {
          ...state.pageSelection,
          selectedPages,
        },
      };
    }),

  updatePagePreview: (pageNum, previewUrl) =>
    set((state) => {
      if (!state.pageSelection) return state;

      return {
        pageSelection: {
          ...state.pageSelection,
          previews: {
            ...state.pageSelection.previews,
            [pageNum]: previewUrl,
          },
        },
      };
    }),

  setStatement: (statement) => set({ statement }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setRowSelection: (rowSelection) => set({ rowSelection }),
  setPreviewsLoading: (previewsLoading) => set({ previewsLoading }),
  setIsDrawingMode: (isDrawingMode) => set({ isDrawingMode }),
  setSelectedPageForDrawing: (selectedPageForDrawing) =>
    set({ selectedPageForDrawing }),
}));

export default importBankStatementStore;
