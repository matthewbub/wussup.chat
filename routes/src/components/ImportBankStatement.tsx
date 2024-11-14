import React, { useState } from "react";
import {
  ColumnDef,
  HeaderGroup,
  Header,
  Row,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { DashboardWrapper } from "./DashboardWrapper";
import { Button } from "@/components/catalyst/button";
import { Checkbox } from "@/components/catalyst/checkbox";

interface Transaction {
  date: string;
  description: string;
  amount: string;
  type: "credit" | "debit";
}

interface StatementData {
  accountNumber: string;
  bankName: string;
  statementDate: string;
  transactions: Transaction[];
}

interface PageSelection {
  fileId: string;
  numPages: number;
  selectedPages: number[];
}

const ImportBankStatement: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageSelection, setPageSelection] = useState<PageSelection | null>(
    null
  );
  const [statement, setStatement] = useState<StatementData | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ getValue }) => (
        <span className="text-right">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            getValue() === "credit"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {getValue() as string}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: statement ? statement.transactions : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");

      // Get page count
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("/api/v1/pdf/page-count", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setPageSelection({
          fileId: data.fileId,
          numPages: data.numPages,
          selectedPages: [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handlePageSelection = (pageNum: number) => {
    if (!pageSelection) return;

    setPageSelection((prev) => {
      if (!prev) return prev;
      const selected = prev.selectedPages.includes(pageNum)
        ? prev.selectedPages.filter((p) => p !== pageNum)
        : [...prev.selectedPages, pageNum];
      return { ...prev, selectedPages: selected };
    });
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

  const handleSave = () => {
    console.log("Save");
    console.log(table.getSelectedRowModel().rows.map((row) => row.original));
  };

  return (
    <DashboardWrapper>
      <div className=" p-4">
        <h2 className="text-2xl font-bold mb-4">PDF Text Extractor</h2>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            />
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {pageSelection && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              Select Pages to Import
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                { length: pageSelection.numPages },
                (_, i) => i + 1
              ).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageSelection(pageNum)}
                  className={`px-4 py-2 rounded ${
                    pageSelection.selectedPages.includes(pageNum)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Page {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={pageSelection.selectedPages.length === 0 || isLoading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >
              {isLoading ? "Processing..." : "Process Selected Pages"}
            </button>
          </div>
        )}

        {statement && (
          <div className="mt-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Statement Details</h3>
                <p>Bank: {statement.bankName}</p>
                <p>Account: {statement.accountNumber}</p>
                <p>Date: {statement.statementDate}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    {table
                      .getHeaderGroups()
                      .map((headerGroup: HeaderGroup<Transaction>) => (
                        <tr key={headerGroup.id} className="bg-gray-100">
                          {headerGroup.headers.map(
                            (header: Header<Transaction, unknown>) => (
                              <th key={header.id} className="px-4 py-2">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </th>
                            )
                          )}
                        </tr>
                      ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row: Row<Transaction>) => (
                      <tr
                        key={row.id}
                        className={row.index % 2 === 0 ? "bg-gray-50" : ""}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <Button color="teal" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
};

export default ImportBankStatement;
