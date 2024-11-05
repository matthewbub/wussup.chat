import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Button } from "@/components/catalyst/button";
import { Input } from "@/components/catalyst/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/documents/")({
  component: DocumentCollectionViewerComponent,
});

interface Document {
  id: string;
  title: string;
  lastEdited: Date;
  sheetCount: number;
  status: "draft" | "published";
}

function generateMockDocuments(count: number): Document[] {
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    title: `Document ${i + 1}`,
    lastEdited: new Date(2023, 5, Math.floor(Math.random() * 30) + 1),
    sheetCount: Math.floor(Math.random() * 10) + 1,
    status: Math.random() > 0.5 ? "published" : "draft",
  }));
}

export function DocumentCollectionViewerComponent() {
  const [documents] = useState<Document[]>(() => generateMockDocuments(150));
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Document;
    direction: "asc" | "desc";
  }>({ key: "lastEdited", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedAndFilteredDocuments = useMemo(() => {
    return [...documents]
      .filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
  }, [documents, searchTerm, sortConfig]);

  const totalPages = Math.ceil(
    sortedAndFilteredDocuments.length / itemsPerPage
  );
  const paginatedDocuments = sortedAndFilteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof Document) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((page, index) => {
      if (page === "ellipsis") {
        return <MoreHorizontal key={`ellipsis-${index}`} className="mx-2" />;
      }
      return (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(page as number)}
        >
          {page}
        </Button>
      );
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Documents</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-64"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <Button>Create New Document</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-[300px] cursor-pointer"
              onClick={() => handleSort("title")}
            >
              Title{" "}
              {sortConfig.key === "title" &&
                (sortConfig.direction === "asc" ? (
                  <SortAsc className="inline" size={16} />
                ) : (
                  <SortDesc className="inline" size={16} />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("lastEdited")}
            >
              Last Edited{" "}
              {sortConfig.key === "lastEdited" &&
                (sortConfig.direction === "asc" ? (
                  <SortAsc className="inline" size={16} />
                ) : (
                  <SortDesc className="inline" size={16} />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("sheetCount")}
            >
              Sheets{" "}
              {sortConfig.key === "sheetCount" &&
                (sortConfig.direction === "asc" ? (
                  <SortAsc className="inline" size={16} />
                ) : (
                  <SortDesc className="inline" size={16} />
                ))}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDocuments.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.title}</TableCell>
              <TableCell>{doc.lastEdited.toLocaleDateString()}</TableCell>
              <TableCell>{doc.sheetCount}</TableCell>
              <TableCell>
                <Badge
                  variant={doc.status === "published" ? "default" : "secondary"}
                >
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {sortedAndFilteredDocuments.length === 0 && (
        <div className="text-center py-4 text-gray-500">No documents found</div>
      )}
      {sortedAndFilteredDocuments.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(
              currentPage * itemsPerPage,
              sortedAndFilteredDocuments.length
            )}{" "}
            of {sortedAndFilteredDocuments.length} documents
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            {renderPaginationButtons()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
