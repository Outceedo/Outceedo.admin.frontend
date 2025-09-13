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
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

interface Sponsor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  status?: string;
  // Add other fields based on your UserProfile model
  profilePicture?: string;
  phoneNumber?: string;
  companyName?: string;
  sponsorshipBudget?: number;
  sponsorshipType?: string;
}

// Minimal Pagination Bar Component
const PaginationBar = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex justify-between items-center px-1 py-2 border-t bg-white dark:bg-gray-800">
      <span className="text-xs text-gray-700 dark:text-gray-300">
        Showing {startItem}-{endItem} of {totalItems}
      </span>
      <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-600">
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-300 transition ${
            currentPage === 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &#60;
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
              className={`w-8 h-8 flex items-center justify-center border-l text-xs ${
                currentPage === pageNum
                  ? "bg-blue-50 text-blue-600 font-semibold border-blue-400 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-300 transition ${
            currentPage === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const itemsPerPage = 7;

  // Calculate pagination based on filtered data
  const totalPages = Math.ceil(filteredSponsors.length / itemsPerPage);
  const paginatedSponsors = filteredSponsors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch sponsors data
  const fetchSponsors = async () => {
    try {
      setLoading(true);
      setError("");

      // Get admin token for authentication
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/sponsor/sponsors`,
        {
          params: {
            page: 1,
            limit: 10, // Get all sponsors for client-side pagination and filtering
          },
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "api-key": adminToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data) {
        setSponsors(response.data.data);
        setFilteredSponsors(response.data.data);
      } else {
        setSponsors([]);
        setFilteredSponsors([]);
      }
    } catch (err: any) {
      console.error("Error fetching sponsors:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (err.response?.status === 404) {
        setError("Sponsors endpoint not found.");
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch sponsors data"
        );
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
    fetchSponsors();
  }, []);

  // Filter sponsors based on search and month
  useEffect(() => {
    let filtered = sponsors;

    // Filter by search term (name or email)
    if (searchTerm) {
      filtered = filtered.filter(
        (sponsor) =>
          `${sponsor.firstName} ${sponsor.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sponsor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sponsor.companyName &&
            sponsor.companyName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((sponsor) => {
        const sponsorMonth = new Date(sponsor.createdAt).toLocaleDateString(
          "en-US",
          { month: "long" }
        );
        return sponsorMonth === selectedMonth;
      });
    }

    setFilteredSponsors(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [sponsors, searchTerm, selectedMonth]);

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
  const getFullName = (sponsor: Sponsor) => {
    return (
      `${sponsor.firstName || ""} ${sponsor.lastName || ""}`.trim() ||
      sponsor.companyName ||
      "N/A"
    );
  };

  // Get sponsorship type
  const getSponsorshipType = (sponsor: Sponsor) => {
    return sponsor.sponsorshipType || "Not specified";
  };

  // Get sponsorship budget
  const getSponsorshipBudget = (sponsor: Sponsor) => {
    if (sponsor.sponsorshipBudget) {
      return `£${sponsor.sponsorshipBudget.toLocaleString()}`;
    }
    return sponsor.sponsorshipType === "Product" ? "-" : "Not specified";
  };

  // Get status badge
  const getStatusBadge = (sponsor: Sponsor) => {
    const status = sponsor.status || "Active"; // Default to Active if no status field

    return (
      <Badge
        className={
          status === "Active"
            ? "bg-green-200 text-green-800 px-2 py-1 w-16 text-xs sm:text-sm mx-auto"
            : "bg-yellow-200 text-yellow-800 px-2 py-1 w-16 text-xs sm:text-sm mx-auto"
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
            <span>Loading sponsors...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6">
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={fetchSponsors}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Registered Sponsors
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search sponsors..."
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

      <div>
        <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
              <TableRow>
                <TableHead className="w-10 text-center"></TableHead>
                <TableHead className="min-w-[160px] text-left">
                  Sponsor Name
                </TableHead>
                <TableHead className="min-w-[170px] text-center">
                  Email
                </TableHead>
                <TableHead className="min-w-[170px] text-center">
                  Registration Date
                </TableHead>
                <TableHead className="min-w-[150px] text-center">
                  Sponsorship Type
                </TableHead>
                <TableHead className="min-w-[160px] text-center">
                  Sponsorship Budget
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  Status
                </TableHead>
                <TableHead className="min-w-[160px] text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSponsors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    {sponsors.length === 0
                      ? "No sponsors found"
                      : "No sponsors match your search criteria"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSponsors.map((sponsor, index) => (
                  <TableRow key={sponsor.id}>
                    <TableCell className="text-center align-middle">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="align-middle">
                      <Link
                        to={`/admin/sponsor-profile/${sponsor.id}`}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {getFullName(sponsor)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {sponsor.email}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {formatDate(sponsor.createdAt)}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {getSponsorshipType(sponsor)}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {getSponsorshipBudget(sponsor)}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {getStatusBadge(sponsor)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSponsors.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Sponsor;
