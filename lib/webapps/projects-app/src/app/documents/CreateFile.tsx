import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModalStore } from "@/stores/modalStore";
import CreatableSelect from "react-select/creatable";
import { StylesConfig } from "react-select";

import { dummyFolders } from "./dummy-data";

type FolderOption = { label: string; value: string };

export function CreateFileModal() {
  const { isOpen, closeModal, type } = useModalStore();
  const [fileName, setFileName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<FolderOption | null>(
    null
  );

  const folderOptions: FolderOption[] = useMemo(
    () =>
      dummyFolders.map((folder) => ({
        label: folder.name,
        value: folder.name,
      })),
    []
  );

  const handleCreate = () => {
    // Implement file creation logic here
    console.log(
      "Creating file:",
      fileName,
      "in folder:",
      selectedFolder?.value || "New folder"
    );
    closeModal();
  };

  const customStyles: StylesConfig<FolderOption, false> = {
    control: (base) => ({
      ...base,
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      backgroundColor: "hsl(var(--background))",
      borderColor: "hsl(var(--border))",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "hsl(var(--background))",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
        ? "hsl(var(--accent))"
        : "hsl(var(--background))",
      color: state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
    }),
  };

  return (
    <Dialog open={isOpen && type === "file"} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter document name"
          />
          <CreatableSelect
            options={folderOptions}
            value={selectedFolder}
            onChange={setSelectedFolder}
            styles={customStyles}
            placeholder="Select or create a folder"
            isClearable
            isSearchable
            formatCreateLabel={(inputValue) => `Create folder "${inputValue}"`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
