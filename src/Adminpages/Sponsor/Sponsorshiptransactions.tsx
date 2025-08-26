import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Sample data
const data = [
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Monetary",
    amount: "£5,000",
    status: "Inactive",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Product",
    amount: "£5,000",
    status: "Active",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Monetary",
    amount: "£5,000",
    status: "Inactive",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Product",
    amount: "£5,000",
    status: "Active",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Monetary",
    amount: "£5,000",
    status: "Inactive",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Product",
    amount: "£5,000",
    status: "Active",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Monetary",
    amount: "£5,000",
    status: "Inactive",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Product",
    amount: "£5,000",
    status: "Active",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Monetary",
    amount: "£5,000",
    status: "Inactive",
  },
  {
    sponsorName: "Text cell lg",
    sponsorInfo: "Secondary info",
    playerName: "Text cell lg",
    playerInfo: "Secondary info",
    date: "12-06-2025",
    type: "Product",
    amount: "£5,000",
    status: "Active",
  },
];

// Pagination Bar Component (clean UI)
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
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3);

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t bg-white">
      <span className="text-xs text-gray-700">Showing 1 out {totalItems}</span>
      <div className="flex rounded overflow-hidden border border-gray-200 gap-0.5 bg-white">
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-100 transition ${
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
            className={`w-8 h-8 flex items-center justify-center text-xs border-x border-gray-200 ${
              currentPage === pageNum
                ? "bg-blue-100 text-blue-700 font-semibold border-blue-400"
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => onPageChange(pageNum)}
            aria-label={`Page ${pageNum}`}
          >
            {pageNum}
          </button>
        ))}
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-100 transition ${
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

const SponsorshipTransactions: React.FC = () => {
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Pagination logic
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-semibold mb-6">Awarded Sponsorship</h2>
       <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl ">
            <TableRow>
              <TableHead className="w-12 text-center ">
                <Checkbox />
              </TableHead>
              <TableHead className="min-w-[180px] text-left ">Sponsors Name</TableHead>
              <TableHead className="min-w-[180px] text-left ">Players Name</TableHead>
              <TableHead className="min-w-[130px] text-center ">Sponsorship Date</TableHead>
              <TableHead className="min-w-[150px] text-center ">Sponsorship Type</TableHead>
              <TableHead className="min-w-[120px] text-center ">Sponsorship Amount</TableHead>
              <TableHead className="min-w-[120px] text-center ">Status</TableHead>
              <TableHead className="min-w-[140px] text-center ">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, idx) => (
              <TableRow key={idx} className="transition">
                <TableCell className="text-center align-middle py-4">
                  <Checkbox />
                </TableCell>
             <TableCell className="align-middle py-4">
  <div>
    <div className="font-medium text-blue-600 underline hover:text-blue-800">
      <Link to={`/sponsor-profile/${row.sponsorName}`}>
        {row.sponsorName}
      </Link>
    </div>
    <div className="text-xs text-gray-500">{row.sponsorInfo}</div>
  </div>
</TableCell>


<TableCell className="align-middle py-4">
  <div>
    <div className="font-medium text-blue-600 underline hover:text-blue-800">
      <Link to={`/player-profile/${row.playerInfo}`}>
        {row.playerName}
      </Link>
    </div>
    <div className="text-xs text-gray-500">{row.playerInfo}</div>
  </div>
</TableCell>
                <TableCell className="text-center align-middle py-4">{row.date}</TableCell>
                <TableCell className="text-center align-middle py-4">{row.type}</TableCell>
                <TableCell className="text-center align-middle py-4">{row.amount}</TableCell>
                <TableCell className="text-center align-middle py-4">
                  <Badge
                    className={
                      row.status === "Active"
                        ? "bg-green-200 text-green-800 px-3 py-1 w-24 text-xs sm:text-sm mx-auto rounded"
                        : "bg-yellow-200 text-yellow-800 px-3 py-1 w-24 text-xs sm:text-sm mx-auto rounded"
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center align-middle py-4">
                  <div className="flex gap-2 justify-center">
                    <Trash2 className="w-5 h-5 text-red-500 cursor-pointer" />
                    <Pencil className="w-5 h-5 text-gray-600 dark:text-white cursor-pointer" />
                    <Eye className="w-5 h-5 text-gray-600 dark:text-white cursor-pointer" />
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-white cursor-pointer" />
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

export default SponsorshipTransactions;