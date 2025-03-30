import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy } from "lucide-react";

export default function MarkdownComponent({ children, className }: { children: string; className?: string }) {
  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      components={{
        pre({ children }) {
          return <div className="relative">{children}</div>;
        },
        // @ts-expect-error - its annoying me
        code: ({ node }: Parameters<CodeComponent>[0]) => {
          // Check if parent is a pre tag
          const isCodeBlock = node.position.start.line !== node.position.end.line;

          if (!isCodeBlock) {
            return <code className="bg-base-300 px-1 rounded">{node.children[0].value}</code>;
          }

          // Code block
          const language = node.properties.className?.[0]?.replace("language-", "") || "";
          const codeContent = node.children[0].value;

          return (
            <div className="group relative">
              <button
                onClick={() => navigator.clipboard.writeText(codeContent)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 hover:text-primary"
                aria-label="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
              <SyntaxHighlighter style={oneDark} language={language || "text"} PreTag="div">
                {codeContent.replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          );
        },
        // Style other markdown elements
        p({ children }) {
          return <p className="mb-4 last:mb-0">{children}</p>;
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              className="text-indigo-500 dark:text-indigo-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        ul({ children }) {
          return <ul className="list-disc ml-6 mb-4">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal ml-6 mb-4">{children}</ol>;
        },
        blockquote({ children }) {
          return <blockquote className="border-l-4 border-base-300 pl-4 italic">{children}</blockquote>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
