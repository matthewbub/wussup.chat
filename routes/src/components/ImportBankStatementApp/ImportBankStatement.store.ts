import { create } from "zustand";
import {
  PagePreviews,
  PageSelection,
  StatementData,
} from "./ImportBankStatement.types";

type State = {
  file: File | null;
  pageSelection: PageSelection | null;
  statement: StatementData | null;
  error: string;
  isLoading: boolean;
  rowSelection: Record<string, boolean>;
  previewsLoading: boolean;
  isDrawingMode: boolean;
  selectedPageForDrawing: number | null;
};

type Action = {
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
  submitSelectedPages: () => Promise<void>;
  handleFileChange: (file: File) => Promise<void>;
  loadPreviews: () => Promise<void>;
};

const importBankStatementStore = create<State & Action>((set) => ({
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

  submitSelectedPages: async () => {
    const state = importBankStatementStore.getState();
    const { pageSelection, file } = state;

    if (!pageSelection || pageSelection.selectedPages.length === 0 || !file) {
      return;
    }

    importBankStatementStore.setState({
      isLoading: true,
      error: "",
      statement: null,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pages", pageSelection.selectedPages.join(","));

    try {
      const response = await fetch("/api/v1/pdf/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      importBankStatementStore.setState({ statement: data });
    } catch (err) {
      importBankStatementStore.setState({
        error: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      importBankStatementStore.setState({ isLoading: false });
    }
  },
  handleFileChange: async (file: File) => {
    if (file?.type === "application/pdf") {
      set({ file, error: "" });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const pageCountResponse = await fetch("/api/v1/pdf/page-count", {
          method: "POST",
          body: formData,
        });

        const pageCountData = await pageCountResponse.json();
        if (!pageCountResponse.ok) throw new Error(pageCountData.error);

        set({
          pageSelection: {
            fileId: pageCountData.fileId,
            numPages: pageCountData.numPages,
            selectedPages: [],
            previews: {},
          },
        });
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : "An error occurred",
          file: null,
        });
      }
    } else {
      set({
        error: "Please select a valid PDF file",
        file: null,
      });
    }
  },
  loadPreviews: async () => {
    const state = importBankStatementStore.getState();
    const { file, pageSelection } = state;
    if (!file || !pageSelection) return;

    importBankStatementStore.setState({ previewsLoading: true });

    for (let pageNum = 1; pageNum <= pageSelection.numPages; pageNum++) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("page", pageNum.toString());

      try {
        const previewResponse = await fetch(
          "http://127.0.0.1:5000/api/v1/image/upload-pdf",
          {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!previewResponse.ok) continue;

        const previewBlob = await previewResponse.blob();
        const previewUrl = URL.createObjectURL(previewBlob);

        importBankStatementStore.setState((state) => ({
          pageSelection: state.pageSelection
            ? {
                ...state.pageSelection,
                previews: {
                  ...state.pageSelection.previews,
                  [pageNum]: previewUrl,
                },
              }
            : null,
        }));
      } catch (error) {
        console.error(`Failed to load preview for page ${pageNum}:`, error);
      }
    }
    importBankStatementStore.setState({ previewsLoading: false });
  },
}));

export default importBankStatementStore;
