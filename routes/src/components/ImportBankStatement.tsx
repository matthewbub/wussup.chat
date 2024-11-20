import React, { useState, useEffect } from "react";
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
import FileUploader from "./FileUploader";

interface Transaction {
  date: string;
  description: string;
  amount: string;
  type: "credit" | "debit";
}

interface StatementData {
  transactions: Transaction[];
}

interface PageSelection {
  fileId: string;
  numPages: number;
  selectedPages: number[];
  previews: { [pageNum: number]: string | null };
}

const ImportBankStatement: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageSelection, setPageSelection] = useState<PageSelection | null>(
    null
  );
  const [statement, setStatement] = useState<StatementData | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [previewsLoading, setPreviewsLoading] = useState<boolean>(false);

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        // TODO: Replace with catalyst checkbox
        // don;t know why it isnt working
        <input
          type="checkbox"
          name="select-all"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          color="green"
          name={`select-${row.id}`}
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
    enableRowSelection: true,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  });

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  useEffect(() => {
    if (!file || !pageSelection) return;

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

          setPageSelection((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              previews: {
                ...prev.previews,
                [pageNum]: previewUrl,
              },
            };
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
    const transactions = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    fetch("/api/v1/pdf/save", {
      method: "POST",
      body: JSON.stringify({ transactions }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <DashboardWrapper>
      <div className=" p-4">
        <h2 className="text-2xl font-bold mb-4">Import Bank Statement</h2>

        <FileUploader
          onFileDrop={(files) => {
            // console.log("files", files);
            handleFileChange(files[0]);
          }}
          buttonLabel="Select PDF file"
          acceptedFileTypes={["application/pdf"]}
        />

        {/* <form onSubmit={handleSubmit} className="mb-6">
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
        </form> */}

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {pageSelection && (
          <div className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {Array.from(
                { length: pageSelection.numPages },
                (_, i) => i + 1
              ).map((pageNum) => (
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
            <div className="bg-white shadow-md rounded-lg">
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
