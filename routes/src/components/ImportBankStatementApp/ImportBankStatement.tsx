import React, { useEffect } from "react";
import { DashboardWrapper } from "../DashboardWrapper";
import FileUploader from "../FileUploader";
import { DrawingData } from "./ImportBankStatement.types";
import PDFDrawingCanvas from "../PDFDrawingCanvas";
import importBankStatementStore from "./ImportBankStatement.store";
import BankStatementDetailsTable from "./components/BankStatementDetailsTable";
import PdfPageSelector from "./components/PdfPageSelector";

const ImportBankStatement: React.FC = () => {
  const file = importBankStatementStore((state) => state.file);
  const setFile = importBankStatementStore((state) => state.setFile);
  const pageSelection = importBankStatementStore(
    (state) => state.pageSelection
  );
  const setPageSelection = importBankStatementStore(
    (state) => state.setPageSelection
  );

  const error = importBankStatementStore((state) => state.error);
  const setError = importBankStatementStore((state) => state.setError);
  const setPreviewsLoading = importBankStatementStore(
    (state) => state.setPreviewsLoading
  );
  const isDrawingMode = importBankStatementStore(
    (state) => state.isDrawingMode
  );
  const setIsDrawingMode = importBankStatementStore(
    (state) => state.setIsDrawingMode
  );
  const selectedPageForDrawing = importBankStatementStore(
    (state) => state.selectedPageForDrawing
  );
  const setSelectedPageForDrawing = importBankStatementStore(
    (state) => state.setSelectedPageForDrawing
  );

  const setPagePreviews = importBankStatementStore(
    (state) => state.setPagePreviews
  );

  const handleFileChange = async (file: File) => {
    if (file && file.type === "application/pdf") {
      setFile(file);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const pageCountResponse = await fetch("/api/v1/pdf/page-count", {
          method: "POST",
          body: formData,
        });

        const pageCountData = await pageCountResponse.json();
        if (!pageCountResponse.ok) throw new Error(pageCountData.error);

        setPageSelection({
          fileId: pageCountData.fileId,
          numPages: pageCountData.numPages,
          selectedPages: [],
          previews: {},
        });
        console.log("Page selection has been initialized");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  useEffect(() => {
    if (
      !file ||
      !pageSelection ||
      Object.keys(pageSelection.previews).length > 0
    )
      return;
    // if (!file || !pageSelection) return;

    const loadPreviews = async () => {
      setPreviewsLoading(true);

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

          setPagePreviews({
            [pageNum]: previewUrl,
          });
        } catch (error) {
          console.error(`Failed to load preview for page ${pageNum}:`, error);
        }
      }
      setPreviewsLoading(false);
    };

    loadPreviews();

    return () => {
      if (pageSelection?.previews) {
        Object.values(pageSelection.previews).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
      }
    };
  }, [file, pageSelection?.numPages]);

  const handleSaveDrawing = async (vectorData: DrawingData[]) => {
    if (!file || selectedPageForDrawing === null) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("page", selectedPageForDrawing.toString());
      formData.append("drawing", JSON.stringify(vectorData));

      const response = await fetch(
        "http://127.0.0.1:5000/api/v1/pdf/apply-drawing",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to save drawing");

      // Update preview with the modified PDF
      const modifiedPdfBlob = await response.blob();
      const previewFormData = new FormData();
      previewFormData.append(
        "file",
        new File([modifiedPdfBlob], "temp.pdf", { type: "application/pdf" })
      );
      previewFormData.append("page", selectedPageForDrawing.toString());

      const previewResponse = await fetch(
        "http://127.0.0.1:5000/api/v1/image/upload-pdf",
        {
          method: "POST",
          body: previewFormData,
        }
      );

      if (!previewResponse.ok) throw new Error("Failed to update preview");

      const previewBlob = await previewResponse.blob();
      const previewUrl = URL.createObjectURL(previewBlob);

      // Revoke old preview URL if it exists
      if (pageSelection?.previews[selectedPageForDrawing]) {
        URL.revokeObjectURL(pageSelection.previews[selectedPageForDrawing]!);
      }

      // Update the preview in state
      setPagePreviews({
        [selectedPageForDrawing]: previewUrl,
      });

      setIsDrawingMode(false);
      setSelectedPageForDrawing(null);
    } catch (error) {
      console.error("Error saving drawing:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save drawing"
      );
    }
  };

  return (
    <DashboardWrapper>
      <div className=" p-4">
        <h2 className="text-2xl font-bold mb-4">Import Bank Statement</h2>

        <FileUploader
          onFileChange={(files) => handleFileChange(files[0])}
          onFileDrop={(files) => handleFileChange(files[0])}
          buttonLabel="Select PDF file"
          acceptedFileTypes={["application/pdf"]}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <PdfPageSelector />
        <BankStatementDetailsTable />

        {isDrawingMode &&
          selectedPageForDrawing &&
          pageSelection?.previews[selectedPageForDrawing] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <PDFDrawingCanvas
                backgroundImage={pageSelection.previews[selectedPageForDrawing]}
                onSave={handleSaveDrawing}
                onClose={() => {
                  setIsDrawingMode(false);
                  setSelectedPageForDrawing(null);
                }}
              />
            </div>
          )}
      </div>
    </DashboardWrapper>
  );
};

export default ImportBankStatement;
