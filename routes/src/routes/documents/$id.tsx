"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import {
  ChevronUp,
  ChevronDown,
  GripVertical,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

interface Sheet {
  id: string;
  label: string;
  content: string;
  includeTitle: boolean;
}

interface DocumentState {
  title: string;
  sheets: Sheet[];
}

export const Route = createFileRoute("/documents/$id")({
  component: DocumentComponent,
});

export default function DocumentComponent({
  initialTitle = "Document",
}: {
  initialTitle?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [sheets, setSheets] = useState<Sheet[]>([
    { id: "1", label: "Sheet 1", content: "", includeTitle: true },
  ]);
  const [viewMode, setViewMode] = useState<"web" | "pages">("web");
  const [currentPage, setCurrentPage] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [joinedMarkdown, setJoinedMarkdown] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const checkIfDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIfDesktop();
    window.addEventListener("resize", checkIfDesktop);
    return () => window.removeEventListener("resize", checkIfDesktop);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem("documentState");
    if (savedState) {
      const { title, sheets } = JSON.parse(savedState) as DocumentState;
      setTitle(title);
      setSheets(sheets);
    }
  }, []);

  useEffect(() => {
    const state: DocumentState = { title, sheets };
    localStorage.setItem("documentState", JSON.stringify(state));
  }, [title, sheets]);

  const addSheet = () => {
    const newSheet = {
      id: Date.now().toString(),
      label: `Sheet ${sheets.length + 1}`,
      content: "",
      includeTitle: true,
    };
    setSheets([...sheets, newSheet]);
  };

  const updateSheet = (
    id: string,
    field: keyof Sheet,
    value: string | boolean
  ) => {
    setSheets(
      sheets.map((sheet) =>
        sheet.id === id ? { ...sheet, [field]: value } : sheet
      )
    );
  };

  const removeSheet = (id: string) => {
    setSheets(sheets.filter((sheet) => sheet.id !== id));
    if (viewMode === "pages") {
      setCurrentPage((prev) => Math.min(prev, sheets.length - 2));
    }
  };

  const moveSheet = (fromIndex: number, toIndex: number) => {
    const newSheets = Array.from(sheets);
    const [reorderedItem] = newSheets.splice(fromIndex, 1);
    newSheets.splice(toIndex, 0, reorderedItem);
    setSheets(newSheets);
  };

  const joinPagesIntoMarkdown = () => {
    const titleMd = `# ${title}\n\n`;
    const sheetsMd = sheets
      .map(
        (sheet) =>
          `${sheet.includeTitle ? `## ${sheet.label}\n\n` : ""}${sheet.content}\n\n`
      )
      .join("");
    const fullMd = titleMd + sheetsMd;
    setJoinedMarkdown(fullMd);
    setIsModalOpen(true);
  };

  const copyToClipboard = async () => {
    if (joinedMarkdown) {
      await navigator.clipboard.writeText(joinedMarkdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const renderSheets = () => {
    if (viewMode === "web") {
      return (
        <div>
          {sheets.map((sheet, index) => (
            <div key={sheet.id} className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-grow flex items-center gap-2">
                  {previewMode ? (
                    <h2 className="text-2xl font-bold">{sheet.label}</h2>
                  ) : (
                    <input
                      type="text"
                      value={sheet.label}
                      onChange={(e) =>
                        updateSheet(sheet.id, "label", e.target.value)
                      }
                      className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-0"
                    />
                  )}
                  {!previewMode && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`include-title-${sheet.id}`}
                        checked={sheet.includeTitle}
                        onCheckedChange={(checked) =>
                          updateSheet(sheet.id, "includeTitle", checked)
                        }
                      />
                      <label
                        htmlFor={`include-title-${sheet.id}`}
                        className="text-sm text-gray-500"
                      >
                        Include title in join
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveSheet(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      moveSheet(index, Math.min(sheets.length - 1, index + 1))
                    }
                    disabled={index === sheets.length - 1}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeSheet(sheet.id)}
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                {previewMode ? (
                  <div className="prose max-w-none">
                    <ReactMarkdown>{sheet.content}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    value={sheet.content}
                    onChange={(e) =>
                      updateSheet(sheet.id, "content", e.target.value)
                    }
                    className="w-full min-h-[200px] p-2 bg-gray-50 rounded resize-y"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      const sheet = sheets[currentPage];
      return sheet ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {previewMode ? (
                <h2 className="text-2xl font-bold">{sheet.label}</h2>
              ) : (
                <input
                  type="text"
                  value={sheet.label}
                  onChange={(e) =>
                    updateSheet(sheet.id, "label", e.target.value)
                  }
                  className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-0"
                />
              )}
              {!previewMode && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`include-title-${sheet.id}`}
                    checked={sheet.includeTitle}
                    onCheckedChange={(checked) =>
                      updateSheet(sheet.id, "includeTitle", checked)
                    }
                  />
                  <label
                    htmlFor={`include-title-${sheet.id}`}
                    className="text-sm text-gray-500"
                  >
                    Include title in join
                  </label>
                </div>
              )}
            </div>
            <button
              onClick={() => removeSheet(sheet.id)}
              className="p-1 hover:bg-gray-100 rounded text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div>
            {previewMode ? (
              <div className="prose max-w-none">
                <ReactMarkdown>{sheet.content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={sheet.content}
                onChange={(e) =>
                  updateSheet(sheet.id, "content", e.target.value)
                }
                className="w-full min-h-[400px] p-2 bg-gray-50 rounded resize-y"
              />
            )}
          </div>
        </div>
      ) : null;
    }
  };

  const TableOfContents = () => (
    <div className="w-64 pr-4">
      <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
      <div className="space-y-2">
        {sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            className={`block w-full text-left px-2 py-1 rounded ${
              (viewMode === "pages" && currentPage === index) ||
              (viewMode === "web" && isElementInViewport(`sheet-${sheet.id}`))
                ? "bg-gray-100"
                : "hover:bg-gray-50"
            }`}
            onClick={() => {
              if (viewMode === "pages") {
                setCurrentPage(index);
              } else {
                document
                  .getElementById(`sheet-${sheet.id}`)
                  ?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            {sheet.label}
          </button>
        ))}
      </div>
    </div>
  );

  const isElementInViewport = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-0"
        />
      </div>

      <div className="flex justify-between items-center mb-8">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "web" | "pages")}
        >
          <TabsList>
            <TabsTrigger value="web">Web View</TabsTrigger>
            <TabsTrigger value="pages">Pages View</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </Button>
          <Button variant="outline" onClick={joinPagesIntoMarkdown}>
            Join Pages into Markdown
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {isDesktop && <TableOfContents />}
        <div className="flex-grow">
          <div className="mb-8">{renderSheets()}</div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={addSheet}>
              Add Sheet
            </Button>
            {viewMode === "pages" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(sheets.length - 1, currentPage + 1))
                  }
                  disabled={currentPage === sheets.length - 1}
                >
                  Next
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Joined Markdown</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-auto">
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              <code>{joinedMarkdown}</code>
            </pre>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isCopied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
