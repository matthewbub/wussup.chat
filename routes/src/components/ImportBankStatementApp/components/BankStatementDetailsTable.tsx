import React from "react";
import {
  ColumnDef,
  HeaderGroup,
  Header,
  Row,
  useReactTable,
  getCoreRowModel,
  flexRender,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";
import { Button } from "@/components/catalyst/button";
import { Checkbox } from "@/components/catalyst/checkbox";
import { Transaction } from "../ImportBankStatement.types";
import importBankStatementStore from "../ImportBankStatement.store";

const BankStatementDetailsTable: React.FC = () => {
  const rowSelection = importBankStatementStore((state) => state.rowSelection);
  const setRowSelection = importBankStatementStore(
    (state) => state.setRowSelection
  );

  const statement = importBankStatementStore((state) => state.statement);

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
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
    onRowSelectionChange: setRowSelection as OnChangeFn<RowSelectionState>,
  });

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

  if (!statement) return null;

  return (
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
  );
};

export default BankStatementDetailsTable;
