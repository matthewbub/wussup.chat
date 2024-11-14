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

const ImportBankStatement: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [statement, setStatement] = useState<StatementData | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError("");
    setStatement(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/pdf/extract", {
        method: "POST",
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
        body: formData,
      });

      const data: StatementData = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract PDF text");
      }

      setStatement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    console.log("Save");
    console.log(table.getSelectedRowModel().rows);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
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

        <button
          type="submit"
          disabled={!file || isLoading}
          className={`px-4 py-2 rounded-md text-white font-medium
            ${
              !file || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isLoading ? "Processing..." : "Extract Text"}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
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
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportBankStatement;
