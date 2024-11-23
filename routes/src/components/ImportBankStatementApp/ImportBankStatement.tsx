import React from "react";
import { DashboardWrapper } from "../DashboardWrapper";
import FileUploader from "../FileUploader";
import importBankStatementStore from "./ImportBankStatement.store";
import BankStatementDetailsTable from "./components/BankStatementDetailsTable";
import PdfPageSelector from "./components/PdfPageSelector";
import PdfSafetyMarker from "./components/PdfSafetyMarker";
import ImportBankStatementLifecycle from "./ImportBankStatement.lifecycle";

const ImportBankStatement: React.FC = () => {
  const error = importBankStatementStore((state) => state.error);
  const handleFileChange = importBankStatementStore(
    (state) => state.handleFileChange
  );

  return (
    <ImportBankStatementLifecycle>
      <DashboardWrapper>
        <div className=" p-4">
          <h2 className="text-2xl font-bold mb-4">Import Bank Statement</h2>

          {/* This is hard coded to only accept a single PDF file */}
          {/* TODO: New Feature - Make this accept multiple files */}
          {/* DX Flow - User Uploads a Bank Statement: https://utfs.io/f/5DbNgXh2h3Mzjo7aymrZuVKHWiU458GMeOYaqmCp6BXb0R7S */}
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
    </ImportBankStatementLifecycle>
  );
};

export default ImportBankStatement;
