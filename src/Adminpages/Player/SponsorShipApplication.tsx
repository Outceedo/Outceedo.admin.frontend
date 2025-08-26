import React, { useEffect, useState } from "react";
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
import { Edit2, Eye, Trash2, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const applications = [
  {
    sponsor: "Sponsor A",
    sponsorSecondary: "Secondary info",
    player: "Player X",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Monetary",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Pending",
  },
  {
    sponsor: "Sponsor B",
    sponsorSecondary: "Secondary info",
    player: "Player Y",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Product",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Approved",
  },
  {
    sponsor: "Sponsor C",
    sponsorSecondary: "Secondary info",
    player: "Player Z",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Product",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Approved",
  },
  {
    sponsor: "Sponsor D",
    sponsorSecondary: "Secondary info",
    player: "Player W",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Monetary",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Pending",
  },
  {
    sponsor: "Sponsor E",
    sponsorSecondary: "Secondary info",
    player: "Player T",
    playerSecondary: "Secondary info",
    applicationDate: "12-06-2025",
    type: "Product",
    allocatedDate: "12-06-2025",
    amount: "£ 380",
    status: "Rejected",
  },
];
 
const SponsorShipApplication: React.FC = () => {
  const [, setMonths] = useState<string[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 10;

const totalPages = Math.ceil(applications.length / pageSize);
const paginatedSponsor = applications.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);
  useEffect(() => {
    const fetchMonths = () => {
      const monthList = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      setTimeout(() => {
        setMonths(monthList);
      }, 500);
    };

    fetchMonths();
  }, []);

  return (
 <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
  <h2 className="text-xl sm:text-2xl font-semibold">Sponsorship Request</h2>
  </div>
<div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
  <Table className="min-w-[800px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead ></TableHead>
              <TableHead>Player's Name</TableHead>
              <TableHead >Sponsor's Name</TableHead>
              <TableHead >Application Date</TableHead>
              <TableHead >Sponsorship Type</TableHead>
              <TableHead >Allocated Date</TableHead>
              <TableHead >Sponsorship</TableHead>
              <TableHead >Status</TableHead>
              <TableHead >Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSponsor.map((app, index) => (
              <TableRow key={index} className="border-b last:border-b-0 ">
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <Checkbox />
                </TableCell>
               
               {/* Player's Name */}
<TableCell className="px-2 sm:px-4 py-2 align-middle">
  <Link to={`/players/${app.player}`} className="font-medium text-xs sm:text-sm md:text-base text-blue-600 underline hover:opacity-80">
    {app.player}
  </Link>
  <div className="text-[10px] sm:text-xs text-gray-500 dark:text-white">{app.playerSecondary}</div>
</TableCell>

{/* Sponsor's Name */}
<TableCell className="px-2 sm:px-4 py-2 align-middle">
  <Link to={`/sponsors/${app.sponsor }`} className="font-medium text-xs sm:text-sm md:text-base text-blue-600 underline hover:opacity-80">
    {app.sponsor}
  </Link>
  <div className="text-[10px] sm:text-xs text-gray-500 dark:text-white">{app.sponsorSecondary}</div>
</TableCell>
               

                {/* Application Date */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <span className="text-xs sm:text-sm">{app.applicationDate}</span>
                </TableCell>

                {/* Type */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <span className="text-xs sm:text-sm">{app.type}</span>
                </TableCell>

                {/* Allocated Date */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <span className="text-xs sm:text-sm">{app.allocatedDate}</span>
                </TableCell>

                {/* Sponsorship Amount */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle font-semibold">
                  <span className="text-xs sm:text-sm">{app.amount}</span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <Badge
                    className={
                      app.status === "Approved"
                        ? "bg-green-100 text-green-800 p-1 w-20 text-xs sm:text-sm"
                        : app.status === "Rejected"
                        ? "bg-red-100 text-red-800 p-1 w-20 text-xs sm:text-sm"
                        : "bg-yellow-100 text-yellow-800 p-1 w-20 text-xs sm:text-sm"
                    }
                  >
                    {app.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-2 sm:px-4 py-2 align-middle">
                  <div className="flex gap-1 sm:gap-2">
                    <button className="text-red-600 hover:bg-red-50 rounded-full p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-blue-50 rounded-full p-1 dark:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-gray-100 rounded-full p-1 dark:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-700 hover:bg-gray-100 rounded-full p-1 dark:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
</div>
<div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
  <div className="text-center sm:text-left w-full sm:w-auto">
    Showing {Math.min((currentPage - 1) * pageSize + 1, applications.length)}–
    {Math.min(currentPage * pageSize, applications.length)} out of {applications.length}
  </div>

  <div className="flex flex-wrap justify-center gap-1">
    <button
      className="border px-2 py-1 rounded"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    >
      ⟨
    </button>

    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        className={`border px-3 py-1 rounded ${currentPage === i + 1 ? "bg-gray-300 font-semibold" : ""}`}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </button>
    ))}

    <button
      className="border px-2 py-1 rounded"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    >
      ⟩
    </button>
  </div>
</div>

    </div>
  );
};

export default SponsorShipApplication;