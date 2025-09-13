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
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Expert {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  status?: string;
  // Add other fields based on your UserProfile model
}

const Expert: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const pageSize = 10;

  // Calculate pagination based on filtered data
  const totalPages = Math.ceil(filteredExperts.length / pageSize);
  const paginatedExperts = filteredExperts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch experts data
  const fetchExperts = async () => {
    try {
      setLoading(true);
      setError("");

      // Get admin token for authentication
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_PORT}/expert/`, {
        params: {
          page: 1,
          limit: 1000, // Get all experts for client-side pagination and filtering
        },
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "api-key": adminToken,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data) {
        setExperts(response.data.data);
        setFilteredExperts(response.data.data);
      } else {
        setExperts([]);
        setFilteredExperts([]);
      }
    } catch (err: any) {
      console.error("Error fetching experts:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (err.response?.status === 404) {
        setError("Experts endpoint not found.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch experts data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize months
  useEffect(() => {
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
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchExperts();
  }, []);

  // Filter experts based on search and month
  useEffect(() => {
    let filtered = experts;

    // Filter by search term (name or email)
    if (searchTerm) {
      filtered = filtered.filter(
        (expert) =>
          `${expert.firstName} ${expert.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          expert.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((expert) => {
        const expertMonth = new Date(expert.createdAt).toLocaleDateString(
          "en-US",
          { month: "long" }
        );
        return expertMonth === selectedMonth;
      });
    }

    setFilteredExperts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [experts, searchTerm, selectedMonth]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Get full name
  const getFullName = (expert: Expert) => {
    return `${expert.firstName || ""} ${expert.lastName || ""}`.trim() || "N/A";
  };

  // Get status badge (you may need to adjust this based on your actual status field)
  const getStatusBadge = (expert: Expert) => {
    // If you don't have a status field, you can determine it based on other criteria
    const status = expert.status || "Active"; // Default to Active if no status field

    return (
      <Badge
        className={
          status === "Active"
            ? "bg-green-200 text-green-800 p-2 w-20"
            : "bg-yellow-200 text-yellow-800 p-2 w-20"
        }
      >
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading experts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={fetchExperts}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          Registered Experts
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or email"
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
        </div>
      </div>

      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead />
              <TableHead>Expert Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExperts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  {experts.length === 0
                    ? "No experts found"
                    : "No experts match your search criteria"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedExperts.map((expert, index) => (
                <TableRow key={expert.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/expert-profile/${expert.id}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {getFullName(expert)}
                    </Link>
                  </TableCell>
                  <TableCell>{expert.email}</TableCell>
                  <TableCell>{formatDate(expert.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(expert)}</TableCell>
                  <TableCell className="flex gap-2 justify-center">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
        <div>
          Showing{" "}
          {Math.min((currentPage - 1) * pageSize + 1, filteredExperts.length)}–
          {Math.min(currentPage * pageSize, filteredExperts.length)} out of{" "}
          {filteredExperts.length}
          {experts.length !== filteredExperts.length &&
            ` (filtered from ${experts.length} total)`}
        </div>
        <div className="flex gap-1">
          <button
            className="border px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ⟨
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`border px-2 rounded ${
                currentPage === i + 1 ? "bg-gray-300 dark:bg-gray-600" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="border px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            ⟩
          </button>
        </div>
      </div>
    </div>
  );
};

export default Expert;
