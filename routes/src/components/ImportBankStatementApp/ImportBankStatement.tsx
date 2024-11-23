import React, { useEffect } from "react";
import { DashboardWrapper } from "../DashboardWrapper";
import FileUploader from "../FileUploader";
import importBankStatementStore from "./ImportBankStatement.store";
import BankStatementDetailsTable from "./components/BankStatementDetailsTable";
import PdfPageSelector from "./components/PdfPageSelector";
import PdfSafetyMarker from "./components/PdfSafetyMarker";

const ImportBankStatement: React.FC = () => {
  const file = importBankStatementStore((state) => state.file);
  const pageSelection = importBankStatementStore(
    (state) => state.pageSelection
  );
  const error = importBankStatementStore((state) => state.error);
  const setPreviewsLoading = importBankStatementStore(
    (state) => state.setPreviewsLoading
  );
  const setPagePreviews = importBankStatementStore(
    (state) => state.setPagePreviews
  );
  const handleFileChange = importBankStatementStore(
    (state) => state.handleFileChange
  );

  useEffect(() => {
    if (
      !file ||
      !pageSelection ||
      Object.keys(pageSelection.previews).length > 0
    )
      return;

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

        {/* 1. After a file is uploaded, the user can select pages to import */}
        <PdfPageSelector />
        {/* 2. (Optional) The user can then draw over the pages to prevent sensitive data from being OCR'd */}
        <PdfSafetyMarker />
        {/* 3. Table view of the data after the user has processed the selected pages */}
        <BankStatementDetailsTable />
      </div>
    </DashboardWrapper>
  );
};

export default ImportBankStatement;
