"use client";

import { useState, useRef } from "react";
import { Paperclip, X } from "lucide-react";
import { AttachmentButton, Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface AttachmentsProps {
  onFileSelect?: (files: File[]) => void;
  multiple?: boolean;
}

export default function Attachments({
  onFileSelect,
  multiple = false,
}: AttachmentsProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    if (onFileSelect) {
      onFileSelect(files);
    }
  };

  const handlePaperclipClick = () => {
    if (selectedFiles.length > 0) {
      setDrawerOpen(true);
    } else {
      inputRef.current?.click();
    }
  };

  const handleRemoveFile = (idxToRemove: number) => {
    const newFiles = selectedFiles.filter((_, idx) => idx !== idxToRemove);
    setSelectedFiles(newFiles);
    if (onFileSelect) {
      onFileSelect(newFiles);
    }
  };

  return (
    <div className="w-fit">
      <div className="flex items-center gap-2">
        <AttachmentButton
          onClick={handlePaperclipClick}
          type="button"
          active={selectedFiles.length > 0}
        >
          <Paperclip className="w-4 h-4 cursor-pointer" />
        </AttachmentButton>
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileInputChange}
          multiple={multiple}
          className="hidden"
        />
      </div>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          {/* Hidden trigger, since we open programmatically */}
          <span className="hidden" />
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Attachments</DrawerTitle>
              <DrawerDescription>
                <p className="text-sm text-muted-foreground">
                  Attachments do not persist between messages by default.
                </p>
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <p className="text-sm text-muted-foreground">
                {selectedFiles.length === 0
                  ? "No attachments."
                  : "Attached files:"}
              </p>
              <ul className="flex flex-col gap-2">
                {selectedFiles.map((file, idx) => (
                  <li
                    key={idx}
                    className="py-2 px-4 rounded-md bg-muted flex items-center justify-between"
                  >
                    <span className="truncate flex-1 mr-2">{file.name}</span>
                    <button
                      type="button"
                      className="ml-2 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => handleRemoveFile(idx)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
