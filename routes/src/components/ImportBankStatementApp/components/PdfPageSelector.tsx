import React, { useEffect } from "react";
import { DrawingData } from "../ImportBankStatement.types";
import importBankStatementStore from "../ImportBankStatement.store";

const PdfPageSelector: React.FC = () => {
  const file = importBankStatementStore((state) => state.file);
  const pageSelection = importBankStatementStore(
    (state) => state.pageSelection
  );
  const togglePageSelection = importBankStatementStore(
    (state) => state.togglePageSelection
  );
  const setStatement = importBankStatementStore((state) => state.setStatement);
  const setError = importBankStatementStore((state) => state.setError);
  const isLoading = importBankStatementStore((state) => state.isLoading);
  const setIsLoading = importBankStatementStore((state) => state.setIsLoading);
  const previewsLoading = importBankStatementStore(
    (state) => state.previewsLoading
  );
  const setIsDrawingMode = importBankStatementStore(
    (state) => state.setIsDrawingMode
  );
  const setSelectedPageForDrawing = importBankStatementStore(
    (state) => state.setSelectedPageForDrawing
  );

  const handlePageSelection = (pageNum: number) => {
    togglePageSelection(pageNum);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pageSelection || pageSelection.selectedPages.length === 0 || !file)
      return;

    setIsLoading(true);
    setError("");
    setStatement(null);

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

      setStatement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!pageSelection) return null;

  console.log(pageSelection);
  return (
    <div className="mt-4">
      <div>
        <h3 className="text-lg font-bold">Select Pages</h3>
        <p className="text-sm text-gray-500">
          {pageSelection?.selectedPages.length} of {pageSelection?.numPages}
          pages selected
        </p>
        <p className="text-sm text-gray-500">
          Your information has not been saved yet.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: pageSelection.numPages }, (_, i) => i + 1).map(
          (pageNum) => (
            <div key={pageNum} className="relative">
              {pageSelection.previews[pageNum] ? (
                <img
                  src={pageSelection.previews[pageNum] || ""}
                  alt={`Page ${pageNum}`}
                  className="max-w-full rounded-lg shadow-md"
                />
              ) : (
                <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                  {previewsLoading ? (
                    <span>Loading...</span>
                  ) : (
                    <span>Preview failed</span>
                  )}
                </div>
              )}
              <button
                onClick={() => {
                  setIsDrawingMode(true);
                  setSelectedPageForDrawing(pageNum);
                }}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Edit
              </button>
              <button
                onClick={() => handlePageSelection(pageNum)}
                className={`absolute bottom-2 right-2 px-2 py-1 rounded ${
                  pageSelection.selectedPages.includes(pageNum)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Page {pageNum}
              </button>
            </div>
          )
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={pageSelection.selectedPages.length === 0 || isLoading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {isLoading ? "Processing..." : "Process Selected Pages"}
      </button>
    </div>
  );
};

export default PdfPageSelector;
