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
// Scalable and Responsive Data Example
const applications = [
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Monetary",
    status: "Inactive",
  },
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Product",
    status: "Active",
  },
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Monetary",
    status: "Inactive",
  },
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Product",
    status: "Active",
  },
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Product",
    status: "Active",
  },
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Monetary",
    status: "Inactive",
  },
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Product",
    status: "Active",
  },
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Product",
    status: "Active",
  },
  {
    sponsorName: "Text cell 1g",
    sponsorInfo: "Secondary info",
    playerName: "Text cell 1g",
    playerInfo: "Secondary info",
    requestDate: "12-06-2025",
    sponsorshipType: "Monetary",
    status: "Inactive",
  },
];

// Minimal Pagination Bar Component
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
  // Show up to 3 page buttons
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3);

  return (
    <div className="flex justify-between items-center px-1 py-2 border-t bg-white">
      <span className="text-xs text-gray-700">Showing 1 out {totalItems}</span>
      <div className="flex rounded overflow-hidden border border-gray-200">
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &#60;
        </button>
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`w-8 h-8 flex items-center justify-center border-l text-xs ${
              currentPage === pageNum
                ? "bg-blue-50 text-blue-600 font-semibold border-blue-400"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &#62;
        </button>
      </div>
    </div>
  );
};

const Playersrequest: React.FC = () => {
  // Pagination Logic
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalItems = applications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedApplications = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
    <div className="p-2 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Player's Request</h2>
      <div className="rounded-lg border overflow-x-auto bg-white dark:bg-gray-800 shadow-sm">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead className="w-10 text-center"></TableHead>
              <TableHead className="min-w-[180px] text-left">Sponsors Name</TableHead>
              <TableHead className="min-w-[180px] text-left">Players Name</TableHead>
              <TableHead className="min-w-[130px] text-center">Request Date</TableHead>
              <TableHead className="min-w-[150px] text-center">Sponsorship Type</TableHead>
              <TableHead className="min-w-[120px] text-center">Status</TableHead>
              <TableHead className="min-w-[140px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplications.map((app, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-center align-middle">
                  <Checkbox />
                </TableCell>
               <TableCell className="align-middle">
  <div>
    <div className="font-medium text-blue-600 underline">
      <Link to={`/sponsor-profile/${app.sponsorName}`}>
        {app.sponsorName}
      </Link>
    </div>
    <div className="text-xs text-gray-500">{app.sponsorInfo}</div>
  </div>
</TableCell>


<TableCell className="align-middle">
  <div>
    <div className="font-medium text-blue-600 underline">
      <Link to={`/player-profile/${app.playerName}`}>
        {app.playerName}
      </Link>
    </div>
    <div className="text-xs text-gray-500">{app.playerInfo}</div>
  </div>
</TableCell>
                <TableCell className="text-center align-middle">{app.requestDate}</TableCell>
                <TableCell className="text-center align-middle">{app.sponsorshipType}</TableCell>
                <TableCell className="text-center align-middle">
                  <Badge
                    className={
                      app.status === "Active"
                        ? "bg-green-200 text-green-800 px-2 py-1 w-16 text-xs sm:text-sm mx-auto"
                        : "bg-yellow-200 text-yellow-800 px-2 py-1 w-16 text-xs sm:text-sm mx-auto"
                    }
                  >
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center align-middle">
                  <div className="flex gap-1 sm:gap-2 justify-center">
                    <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" />
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-white cursor-pointer" />
                    <Eye className="w-4 h-4 text-gray-600 dark:text-white cursor-pointer" />
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-white cursor-pointer" />
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

export default Playersrequest;