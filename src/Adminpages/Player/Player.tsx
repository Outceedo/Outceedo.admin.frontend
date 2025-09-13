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
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import axios from "axios";

interface PlayerData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  age: number | null;
  bio: string | null;
  city: string | null;
  club: string | null;
  company: string | null;
  country: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  photo: string | null;
  profession: string | null;
  subProfession: string | null;
  sport: string | null;
  language: string[] | null;
  skills: any[];
  interests: any[];
  socialLinks: any | null;
  stripeCustomerId: string | null;
  // Add other fields as needed
}

const Player: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [totalPlayers, setTotalPlayers] = useState(0);

  const pageSize = 10;
  const totalPages = Math.ceil(totalPlayers / pageSize);

  const fetchPlayers = async (page: number) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${
          import.meta.env.VITE_PORT || "http://localhost:3000"
        }/player/players`,
        {
          params: {
            page: page,
            limit: pageSize,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "API-Key": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setPlayers(response.data);
        // Estimate total players for pagination
        if (response.data.length < pageSize && page === 1) {
          setTotalPlayers(response.data.length);
        } else if (response.data.length < pageSize) {
          setTotalPlayers((page - 1) * pageSize + response.data.length);
        } else {
          setTotalPlayers(page * pageSize + 1);
        }
      }
    } catch (error: any) {
      console.error("Error fetching players:", error);

      if (error.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (error.response?.status === 400) {
        setError("Invalid request parameters.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to fetch players. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMonths = () => {
      const monthList = [
        "All Months",
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
      setMonths(monthList);
      setSelectedMonth("All Months");
    };
    fetchMonths();
  }, []);

  useEffect(() => {
    fetchPlayers(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getFullName = (player: PlayerData) => {
    const firstName = player.firstName || "";
    const lastName = player.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || player.username;
  };

  const getAccountType = (player: PlayerData) => {
    return player.stripeCustomerId ? "Premium" : "Free";
  };

  const getSubscriptionType = (player: PlayerData) => {
    // You can enhance this logic based on your subscription data
    return player.stripeCustomerId ? "Yearly" : "Monthly";
  };

  const filteredPlayers = players.filter((player) => {
    const fullName = getFullName(player);
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.username.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedMonth === "All Months" || !selectedMonth) return matchesSearch;

    const playerMonth = new Date(player.createdAt).toLocaleDateString("en-US", {
      month: "long",
    });
    return matchesSearch && playerMonth === selectedMonth;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">Players Details</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading players...</span>
        </div>
      </div>
    );
  }

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
              placeholder="Search by name or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
            />
          </div>
          <select
            className="border px-3 py-2 rounded-md dark:bg-gray-900 w-full sm:w-auto"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
          <Button
            onClick={() => fetchPlayers(currentPage)}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead className="w-5"></TableHead>
              <TableHead className="min-w-[160px]">Player Name</TableHead>
              <TableHead className="min-w-[140px]">Registration Date</TableHead>
              <TableHead className="min-w-[160px]">Username</TableHead>
              <TableHead className="min-w-[100px]">Account Type</TableHead>
              <TableHead className="min-w-[100px]">Subscription</TableHead>
              <TableHead className="min-w-[130px]">Sport/Position</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[120px] text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm || selectedMonth !== "All Months"
                    ? "No players found matching your criteria"
                    : "No players found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {player.photo && (
                        <img
                          src={player.photo}
                          alt={getFullName(player)}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="flex flex-col">
                        <Link
                          to={`/player-profile/${player.id}`}
                          className="text-blue-600 underline hover:text-blue-800 font-medium"
                        >
                          {getFullName(player)}
                        </Link>
                        {player.club && (
                          <span className="text-xs text-gray-500">
                            {player.club}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(player.createdAt)}</TableCell>
                  <TableCell>
                    <span className="font-medium">@{player.username}</span>
                    {player.country && (
                      <div className="text-xs text-gray-500">
                        {player.country}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        getAccountType(player) === "Premium"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getAccountType(player)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          getSubscriptionType(player) === "Yearly"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                    >
                      {getSubscriptionType(player)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {player.sport && (
                        <span className="font-medium text-sm">
                          {player.sport}
                        </span>
                      )}
                      {player.subProfession && (
                        <span className="text-xs text-gray-500">
                          {player.subProfession}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-200 text-green-800 px-2 py-1 w-20 text-center">
                      Active
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {players.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
          <div>
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, filteredPlayers.length)}
            –{Math.min(currentPage * pageSize, filteredPlayers.length)} of{" "}
            {totalPlayers}
          </div>
          <div className="flex gap-1">
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ⟨
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`border px-3 py-1 rounded ${
                    currentPage === pageNum ? "bg-gray-300 font-semibold" : ""
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              ⟩
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
