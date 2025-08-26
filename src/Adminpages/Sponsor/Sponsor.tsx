import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
// Scalable sponsor data structure to support new fields
const sponsors = [
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Monetary",
    budget: "£5,000",
    email: "userA@example.com",
    status: "Inactive",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Product",
    budget: "-",
    email: "userB@example.com",
    status: "Active",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Monetary",
    budget: "£5,000",
    email: "userC@example.com",
    status: "Active",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Monetary",
    budget: "£5,000",
    email: "userD@example.com",
    status: "Active",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Product",
    budget: "-",
    email: "userE@example.com",
    status: "Inactive",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Product",
    budget: "-",
    email: "userF@example.com",
    status: "Inactive",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Monetary",
    budget: "£5,000",
    email: "userG@example.com",
    status: "Inactive",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Product",
    budget: "-",
    email: "userH@example.com",
    status: "Inactive",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Monetary",
    budget: "£5,000",
    email: "userI@example.com",
    status: "Inactive",
  },
  {
    name: "User name",
    joined: "18th June 2025",
    sponsorshipType: "Product",
    budget: "-",
    email: "userJ@example.com",
    status: "Inactive",
  },
];

// Minimal Pagination Bar Component (same UI as previous)
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
          className={`w-8 h-8 flex items-center justify-center text-gray-500  transition ${
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

const Sponsor: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const monthList = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    setMonths(monthList);
  }, []);

  // Responsive filter/search logic
  const filteredSponsors = sponsors.filter((sponsor) => {
    const searchLower = search.toLowerCase();
    return (
      (!selectedMonth || sponsor.joined.toLowerCase().includes(selectedMonth.toLowerCase())) &&
      (!searchLower ||
        sponsor.name.toLowerCase().includes(searchLower) ||
        sponsor.email.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const totalItems = filteredSponsors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedSponsors = filteredSponsors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-2 sm:p-6">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Registered Sponsors</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <select
            className="border px-3 py-2 rounded-md dark:bg-gray-900 w-full sm:w-auto"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Month</option>
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
       <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead className="w-10 text-center"></TableHead>
              <TableHead className="min-w-[160px] text-left">Sponsors Name</TableHead>
              <TableHead className="min-w-[170px] text-center">Registration Date</TableHead>
              <TableHead className="min-w-[150px] text-center">Sponsorship Type</TableHead>
              <TableHead className="min-w-[160px] text-center">Sponsorship Budget</TableHead>
              <TableHead className="min-w-[120px] text-center">Status</TableHead>
              <TableHead className="min-w-[160px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSponsors.map((sponsor, index) => (
              <TableRow key={index}>
                <TableCell className="text-center align-middle">
                  <Checkbox />
                </TableCell>
               <TableCell className="align-middle">
  <Link
    to={`/sponsor-profile/${sponsor.sponsorshipType}`} // Replace with your actual route
    className="text-blue-600 underline hover:text-blue-800"
  >
    {sponsor.name}
  </Link>
</TableCell>
                <TableCell className="text-center align-middle">{sponsor.joined}</TableCell>
                <TableCell className="text-center align-middle">{sponsor.sponsorshipType}</TableCell>
                <TableCell className="text-center align-middle">{sponsor.budget}</TableCell>
                <TableCell className="text-center align-middle">
                  <Badge
                    className={
                      sponsor.status === "Active"
                        ? "bg-green-200 text-green-800 px-2 py-1 w-16 text-xs sm:text-sm mx-auto"
                        : "bg-yellow-200 text-yellow-800 px-2 py-1 w-16 text-xs sm:text-sm mx-auto"
                    }
                  >
                    {sponsor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center align-middle">
                  <div className="flex gap-1 sm:gap-2 justify-center">
                    <Button size="icon" variant="ghost">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-white" />
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

export default Sponsor;