import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/documents/$id")({
  component: DocumentViewer,
});

interface Sheet {
  label: string;
  content: string;
}

export function DocumentViewer({
  initialTitle = "Document",
}: {
  initialTitle?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [sheets, setSheets] = useState<Sheet[]>([
    { label: "Sheet 1", content: "" },
  ]);
  const [viewMode, setViewMode] = useState<"web" | "pages">("web");
  const [currentPage, setCurrentPage] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIfDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIfDesktop();
    window.addEventListener("resize", checkIfDesktop);
    return () => window.removeEventListener("resize", checkIfDesktop);
  }, []);

  const addSheet = () => {
    setSheets([
      ...sheets,
      { label: `Sheet ${sheets.length + 1}`, content: "" },
    ]);
  };

  const updateSheet = (index: number, field: keyof Sheet, value: string) => {
    setSheets(
      sheets.map((sheet, i) =>
        i === index ? { ...sheet, [field]: value } : sheet
      )
    );
  };

  const renderSheets = () => {
    if (viewMode === "web") {
      return sheets.map((sheet, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-stone-200 border-gray-200 dark:border-stone-800"
        >
          <div className="mb-2">
            {previewMode ? (
              <div className="text-sm text-gray-400 mb-2">{sheet.label}</div>
            ) : (
              <Input
                value={sheet.label}
                onChange={(e) => updateSheet(index, "label", e.target.value)}
                className="font-bold text-lg"
              />
            )}
          </div>
          <div>
            {previewMode ? (
              <div className="prose max-w-none">
                <ReactMarkdown>{sheet.content}</ReactMarkdown>
              </div>
            ) : (
              <Textarea
                className="w-full min-h-[200px]"
                value={sheet.content}
                onChange={(e) => updateSheet(index, "content", e.target.value)}
              />
            )}
          </div>
        </div>
      ));
    } else {
      const sheet = sheets[currentPage];
      return sheet ? (
        <div className="p-4 border border-stone-200 border-gray-200 dark:border-stone-800">
          <div className="mb-2">
            {previewMode ? (
              <div className="text-sm text-gray-400 mb-2">{sheet.label}</div>
            ) : (
              <Input
                value={sheet.label}
                onChange={(e) =>
                  updateSheet(currentPage, "label", e.target.value)
                }
                className="font-bold text-lg"
              />
            )}
          </div>
          <div>
            {previewMode ? (
              <div className="prose max-w-none">
                <ReactMarkdown>{sheet.content}</ReactMarkdown>
              </div>
            ) : (
              <Textarea
                className="w-full min-h-[400px]"
                value={sheet.content}
                onChange={(e) =>
                  updateSheet(currentPage, "content", e.target.value)
                }
              />
            )}
          </div>
        </div>
      ) : null;
    }
  };

  const TableOfContents = () => (
    <ScrollArea className="h-[calc(100vh-2rem)] w-64 border">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Table of Contents</h2>
        {sheets.map((sheet, index) => (
          <button
            key={index}
            className={`block w-full text-left px-2 py-1 ${
              (viewMode === "pages" && currentPage === index) ||
              (viewMode === "web" && isElementInViewport(`sheet-${index}`))
                ? "bg-gray-200 dark:bg-gray-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => {
              if (viewMode === "pages") {
                setCurrentPage(index);
              } else {
                document
                  .getElementById(`sheet-${index}`)
                  ?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            {sheet.label}
          </button>
        ))}
      </div>
    </ScrollArea>
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
      <div className="mb-4 p-4 border border-stone-200 border-gray-200 dark:border-stone-800">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "web" | "pages")}
        >
          <TabsList>
            <TabsTrigger value="web">Web View</TabsTrigger>
            <TabsTrigger value="pages">Pages View</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </Button>
      </div>

      <div className="flex gap-4">
        {isDesktop && <TableOfContents />}
        <div className="flex-grow">
          <div>{renderSheets()}</div>

          <div className="flex gap-2 mt-4">
            <Button onClick={addSheet}>Add Sheet</Button>
            {viewMode === "pages" && (
              <>
                <Button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage(Math.min(sheets.length - 1, currentPage + 1))
                  }
                  disabled={currentPage === sheets.length - 1}
                >
                  Next
                </Button>
              </>
            )}
            <Button>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
