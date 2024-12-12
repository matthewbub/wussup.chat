import React, { useState } from "react";
import { Transaction } from "../../types/budget";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
  categories: string[];
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  categories,
}: AddTransactionModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [store, setStore] = useState("");
  const [estimatedNextAmount, setEstimatedNextAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      date: new Date().toISOString().split("T")[0],
      description,
      amount: parseFloat(amount),
      category,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      ...(category === "Grocery" && {
        store,
        estimatedNextAmount: parseFloat(estimatedNextAmount) || 0,
      }),
    };
    onAddTransaction(newTransaction);
    onClose();
    setDescription("");
    setAmount("");
    setCategory(categories[0]);
    setStore("");
    setEstimatedNextAmount("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              step="0.01"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {category === "Grocery" && (
            <>
              <div>
                <label
                  htmlFor="store"
                  className="block text-sm font-medium text-gray-700"
                >
                  Store
                </label>
                <Input
                  type="text"
                  id="store"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="estimatedNextAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Estimated Next Amount
                </label>
                <Input
                  type="number"
                  id="estimatedNextAmount"
                  value={estimatedNextAmount}
                  onChange={(e) => setEstimatedNextAmount(e.target.value)}
                  step="0.01"
                />
              </div>
            </>
          )}
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
