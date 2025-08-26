import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const players = [
  {
    id: 1,
    name: "User One",
    email: "user1@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
  {
    id: 2,
    name: "User Two",
    email: "user2@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 3,
    name: "User Three",
    email: "user3@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Monthly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 4,
    name: "User Four",
    email: "user4@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Monthly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 5,
    name: "User Five",
    email: "user5@example.com",
    joined: "18th June 2025",
    Account: "Premium",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
  {
    id: 6,
    name: "User Six",
    email: "user6@example.com",
    joined: "18th June 2025",
    Account: "Premium",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 7,
    name: "User Seven",
    email: "user7@example.com",
    joined: "18th June 2025",
    Account: "Premium",
    subscription: "Monthly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
  {
    id: 8,
    name: "User Eight",
    email: "user8@example.com",
    joined: "18th June 2025",
    Account: "Premium",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
  {
    id: 9,
    name: "User Nine",
    email: "user9@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Monthly",
    subscriptionExpired: "12 May 2026",
    status: "Active",
  },
  {
    id: 10,
    name: "User Ten",
    email: "user10@example.com",
    joined: "18th June 2025",
    Account: "Free",
    subscription: "Yearly",
    subscriptionExpired: "12 May 2026",
    status: "Inactive",
  },
];

const Player: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(players.length / pageSize);
  const paginatedPlayers = players.slice(
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Players Details</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name"
              className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
            />
          </div>
          <select className="border px-3 py-2 rounded-md dark:bg-gray-900 w-full sm:w-auto">
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
       <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead className="w-5"></TableHead>
              <TableHead className="min-w-[160px]">Player Name</TableHead>
              <TableHead className="min-w-[140px]">Registration Date</TableHead>
              <TableHead className="min-w-[160px]">Email</TableHead>
              <TableHead className="min-w-[100px]">Account Type</TableHead>
              <TableHead className="min-w-[100px]">Subscription</TableHead>
              <TableHead className="min-w-[130px]">Account Expiry</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedPlayers.map((player, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  
                   
                    <Link
                      to={`/player-profile/${player.id}`}
                      className="text-blue-600 underline "
                    >
                      {player.name}
                    </Link>
                  
                </TableCell>
                <TableCell>{player.joined}</TableCell>
                <TableCell>{player.email}</TableCell>
                <TableCell>{player.Account}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium
                      ${player.subscription === "Yearly"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"}`}
                  >
                    {player.subscription}
                  </span>
                </TableCell>
                <TableCell>{player.subscriptionExpired}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      player.status === "Active"
                        ? "bg-green-200 text-green-800 px-2 py-1 w-20 text-center"
                        : "bg-yellow-200 text-yellow-800 px-2 py-1 w-20 text-center"
                    }
                  >
                    {player.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
        <div>
          Showing {Math.min((currentPage - 1) * pageSize + 1, players.length)}–
          {Math.min(currentPage * pageSize, players.length)} of {players.length}
        </div>
        <div className="flex gap-1">
          <button
            className="border px-2 rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ⟨
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`border px-2 rounded ${currentPage === i + 1 ? "bg-gray-300" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="border px-2 rounded"
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

export default Player;
