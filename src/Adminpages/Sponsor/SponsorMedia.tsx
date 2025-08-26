import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Pencil,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Dummy sponsor media data for demonstration
const mediaData = [
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Pending",
  },
  {
    sponsor: "Sponsor Name",
    audio: "View",
    video: "View",
    certificate: "View",
    award: "View",
    affiliation: "-",
    status: "Completed",
  },
];

const PaginationBar = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-between items-center px-4 py-4 border-t bg-white dark:bg-gray-900">
      <span className="text-xs text-gray-700 dark:text-gray-300">
        Showing {(currentPage - 1) * 7 + 1} to {Math.min(currentPage * 7, totalItems)} of {totalItems}
      </span>
      <div className="flex rounded overflow-hidden border border-gray-300 dark:border-gray-700 gap-0.5 bg-white dark:bg-gray-800">
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          &#60;
        </button>
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`w-8 h-8 text-xs flex items-center justify-center ${
              currentPage === pageNum
                ? "bg-blue-100 text-blue-700 font-semibold border border-blue-400"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          &#62;
        </button>
      </div>
    </div>
  );
};

const SponsorMedia: React.FC = () => {
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalItems = mediaData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMedia = mediaData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold">Sponsor's Media</h2>
        <select className="border px-3 py-2 rounded-md bg-white dark:bg-gray-900">
          <option>October</option>
        </select>
      </div>
      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox />
              </TableHead>
              <TableHead className="min-w-[160px] text-left">Sponsor Name</TableHead>
              <TableHead className="min-w-[120px] text-center">Audio</TableHead>
              <TableHead className="min-w-[120px] text-center">Videos</TableHead>
              <TableHead className="min-w-[120px] text-center">Certificates</TableHead>
              <TableHead className="min-w-[120px] text-center">Awards</TableHead>
              <TableHead className="min-w-[120px] text-center">Affiliation</TableHead>
              <TableHead className="min-w-[120px] text-center">Status</TableHead>
              <TableHead className="min-w-[140px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMedia.map((item, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <TableCell className="text-center align-middle py-4">
                  <Checkbox />
                </TableCell>
                <TableCell className="align-middle py-4">
                  <Link to="#" className="underline text-blue-600 hover:text-blue-800">
                    {item.sponsor}
                  </Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Link to="#" className="text-blue-600 underline hover:text-blue-800">{item.audio}</Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Link to="#" className="text-blue-600 underline hover:text-blue-800">{item.video}</Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Link to="#" className="text-blue-600 underline hover:text-blue-800">{item.certificate}</Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Link to="#" className="text-blue-600 underline hover:text-blue-800">{item.award}</Link>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  {item.affiliation}
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Badge
                    className={
                      item.status === "Completed"
                        ? "bg-green-200 text-green-800 px-3 py-1 w-24 text-xs sm:text-sm mx-auto rounded"
                        : "bg-yellow-200 text-yellow-800 px-3 py-1 w-24 text-xs sm:text-sm mx-auto rounded"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <div className="flex gap-2 justify-center">
                    <Button size="icon" variant="ghost">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-5 h-5 text-gray-600 dark:text-white" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Eye className="w-5 h-5 text-gray-600 dark:text-white" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-white" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
         <div className="text-sm mt-4 flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Showing 1 out of 100</span>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost">
                          {"<"}
                        </Button>
                        <Button size="sm" variant="outline" className="dark:text-white">
                          1
                        </Button>
                        <Button size="sm" variant="ghost">
                          2
                        </Button>
                        <Button size="sm" variant="ghost">
                          {">"}
                        </Button>
                      </div>
                    </div>
      </div>
    </div>
  );
};

export default SponsorMedia;
