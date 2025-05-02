"use client";

import { useState, useRef } from "react";
import { Paperclip } from "lucide-react";
import { Button } from "./ui/button";

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    if (onFileSelect) {
      onFileSelect(files);
    }
  };

  const handlePaperclipClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-fit space-y-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePaperclipClick}
          type="button"
          size="icon"
          variant="outline"
        >
          <Paperclip className="w-4 h-4 cursor-pointer" />
        </Button>
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileInputChange}
          multiple={multiple}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="break-all">{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
