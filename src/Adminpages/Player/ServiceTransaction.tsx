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
import { Trash2, Pencil, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const transactions = [
  {
    player: "Player Name",
    playerSecondary: "Secondary info",
    expert: "Expert Name",
    expertSecondary: "Secondary info",
    serviceDate: "12-06-2025",
    serviceType: "Online Video Assessment",
    fee: 719.0,
    status: "Pending",
  },
  {
    player: "Player Name",
    playerSecondary: "Secondary info",
    expert: "Expert Name",
    expertSecondary: "Secondary info",
    serviceDate: "12-06-2025",
    serviceType: "1-on-1 Online Training or advice",
    fee: 188.0,
    status: "Rejected",
  },
  {
    player: "Player Name",
    playerSecondary: "Secondary info",
    expert: "Expert Name",
    expertSecondary: "Secondary info",
    serviceDate: "12-06-2025",
    serviceType: "Online Video Assessment",
    fee: 674.0,
    status: "Approved",
  },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ServiceTransaction: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("October");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(transactions.length / pageSize);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          Service Transactions
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <select className="border px-3 py-2 rounded-md dark:bg-gray-900 w-full sm:w-auto">
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/*  Responsive Table Wrapper */}
       <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="w-full table-auto">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead >
                Player Name
              </TableHead>
              <TableHead >
                Expert Name
              </TableHead>
              <TableHead >
                Service Date
              </TableHead>
              <TableHead >
                Service Type
              </TableHead>
              <TableHead >
                Service Fees
              </TableHead>
              <TableHead >
                Status
              </TableHead>
              <TableHead >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((item, idx) => (
              <TableRow
                key={idx}
                className="border-b last:border-b-0 "
              >
                <TableCell className=" align-middle">
                  <Checkbox />
                </TableCell>
               <TableCell className="p-3 align-middle">
  <div>
    <Link
      to={`/players/${item.player}`} // Replace with actual route parameter
      className="font-medium text-sm sm:text-base text-blue-600 underline hover:opacity-80"
    >
      {item.player}
    </Link>
    <div className="text-gray-500 text-xs sm:text-sm">
      {item.playerSecondary}
    </div>
  </div>
</TableCell>

<TableCell className="p-3 align-middle">
  <div>
    <Link
      to={`/experts/${item.expert}`} // Replace with actual route parameter
      className="font-medium text-sm sm:text-base text-blue-600 underline hover:opacity-80"
    >
      {item.expert}
    </Link>
    <div className="text-gray-500 text-xs sm:text-sm">
      {item.expertSecondary}
    </div>
  </div>
</TableCell>

                <TableCell className="px-4 py-3 align-middle text-sm sm:text-base">
                  {item.serviceDate}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-sm sm:text-base">
                  {item.serviceType}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle font-semibold text-sm sm:text-base">
                  £{item.fee.toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <Badge
                    className={`p-1 px-2 w-20 text-center text-xs sm:text-sm ${
                      item.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <div className="flex gap-2">
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
                      <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-white" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
        <div className="text-center sm:text-left w-full sm:w-auto">
          Showing{" "}
          {Math.min((currentPage - 1) * pageSize + 1, transactions.length)}–{" "}
          {Math.min(currentPage * pageSize, transactions.length)} of{" "}
          {transactions.length}
        </div>

        <div className="flex flex-wrap justify-center gap-1 w-full sm:w-auto">
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
              className={`border px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-gray-300 font-semibold" : ""
              }`}
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

export default ServiceTransaction;
