import React, { useState, useEffect } from "react";
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
import {
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

// Interface based on your SponsorApplication model for awarded sponsorships
interface AwardedSponsorship {
  id: string;
  playerId: string;
  sponsorId: string;
  applicationDate?: string;
  sponsorshipType?: string;
  amount?: number;
  status: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  // Relations (if included in your API response)
  player?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  sponsor?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    companyName?: string;
  };
}

const months = [
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

// Pagination Bar Component
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
    <div className="flex justify-between items-center px-6 py-4 border-t bg-white dark:bg-gray-800">
      <span className="text-xs text-gray-700 dark:text-gray-300">
        Showing {startItem} to {endItem} of {totalItems}
      </span>
      <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-600 gap-0.5 bg-white dark:bg-gray-800">
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
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
              className={`w-8 h-8 flex items-center justify-center text-xs border-x border-gray-200 dark:border-gray-600 ${
                currentPage === pageNum
                  ? "bg-blue-100 text-blue-700 font-semibold border-blue-400 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => onPageChange(pageNum)}
              aria-label={`Page ${pageNum}`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          className={`w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
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

const SponsorshipOfferedTable: React.FC = () => {
  const [sponsorships, setSponsorships] = useState<AwardedSponsorship[]>([]);
  const [filteredSponsorships, setFilteredSponsorships] = useState<
    AwardedSponsorship[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredSponsorships.length / itemsPerPage);
  const paginatedSponsorships = filteredSponsorships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusOptions = [
    "All Status",
    "ACCEPTED",
    "COMPLETED",
    "ACTIVE",
    "PENDING",
  ];

  // Fetch awarded sponsorships
  const fetchAwardedSponsorships = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/sponsor/applications/awarded`,
        {
          params: {
            page: 1,
            limit: 10, // Get all data for client-side pagination and filtering
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "api-key": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data) {
        setSponsorships(response.data.data);
        setFilteredSponsorships(response.data.data);
      } else {
        setSponsorships([]);
        setFilteredSponsorships([]);
      }
    } catch (error: any) {
      console.error("Error fetching awarded sponsorships:", error);

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (error.response?.status === 404) {
        setError("Awarded sponsorships endpoint not found.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to fetch awarded sponsorships"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter sponsorships based on search, status, and month
  useEffect(() => {
    let filtered = sponsorships;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((sponsorship) => {
        const sponsorName = sponsorship.sponsor
          ? `${sponsorship.sponsor.firstName || ""} ${
              sponsorship.sponsor.lastName || ""
            }`.trim() ||
            sponsorship.sponsor.companyName ||
            sponsorship.sponsor.email ||
            sponsorship.sponsorId
          : sponsorship.sponsorId;

        const playerName = sponsorship.player
          ? `${sponsorship.player.firstName || ""} ${
              sponsorship.player.lastName || ""
            }`.trim() ||
            sponsorship.player.email ||
            sponsorship.playerId
          : sponsorship.playerId;

        return (
          sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sponsorship.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== "All Status") {
      filtered = filtered.filter(
        (sponsorship) =>
          sponsorship.status.toUpperCase() === selectedStatus.toUpperCase()
      );
    }

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((sponsorship) => {
        const sponsorshipMonth = new Date(
          sponsorship.createdAt
        ).toLocaleDateString("en-US", { month: "long" });
        return sponsorshipMonth === selectedMonth;
      });
    }

    setFilteredSponsorships(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [sponsorships, searchTerm, selectedStatus, selectedMonth]);

  useEffect(() => {
    fetchAwardedSponsorships();
  }, []);

  // Helper functions
  const getSponsorDisplayName = (sponsorship: AwardedSponsorship) => {
    if (sponsorship.sponsor) {
      const fullName = `${sponsorship.sponsor.firstName || ""} ${
        sponsorship.sponsor.lastName || ""
      }`.trim();
      return (
        fullName ||
        sponsorship.sponsor.companyName ||
        sponsorship.sponsor.email ||
        "Unknown Sponsor"
      );
    }
    return `Sponsor ${sponsorship.sponsorId.substring(0, 8)}...`;
  };

  const getSponsorshipType = (sponsorship: AwardedSponsorship) => {
    return sponsorship.sponsorshipType || "Not specified";
  };

  const getSponsorshipAmount = (sponsorship: AwardedSponsorship) => {
    if (sponsorship.amount && sponsorship.amount > 0) {
      return `£${sponsorship.amount.toLocaleString()}`;
    }
    return sponsorship.sponsorshipType === "Product" ? "-" : "Not specified";
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    let className = "px-3 py-1 w-24 text-xs sm:text-sm mx-auto rounded";

    switch (statusUpper) {
      case "ACCEPTED":
      case "COMPLETED":
      case "ACTIVE":
        className += " bg-green-200 text-green-800";
        break;
      case "PENDING":
        className += " bg-yellow-200 text-yellow-800";
        break;
      case "REJECTED":
      case "INACTIVE":
        className += " bg-red-200 text-red-800";
        break;
      default:
        className += " bg-gray-200 text-gray-800";
    }

    return <Badge className={className}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <h2 className="text-2xl font-semibold mb-4">Sponsorship Offered</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            Loading awarded sponsorships...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 sm:p-8">
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertDescription className="text-red-800 dark:text-red-400">
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={fetchAwardedSponsorships}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Sponsorship Offered</h2>

          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search sponsorships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
              />
            </div>

            <select
              className="border px-3 py-2 rounded-md bg-white dark:bg-gray-900 w-full sm:w-auto"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              className="border px-3 py-2 rounded-md bg-white dark:bg-gray-900 w-full sm:w-auto"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border bg-white dark:bg-gray-800 overflow-x-auto shadow-sm">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
              <TableRow>
                <TableHead className="w-10 text-center"></TableHead>
                <TableHead className="min-w-[180px] text-left">
                  Sponsor Name
                </TableHead>
                <TableHead className="min-w-[150px] text-center">
                  Sponsorship Type
                </TableHead>
                <TableHead className="min-w-[170px] text-center">
                  Sponsorship Amount
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  Status
                </TableHead>
                <TableHead className="min-w-[140px] text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSponsorships.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    {sponsorships.length === 0
                      ? "No awarded sponsorships found"
                      : "No sponsorships match your search criteria"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSponsorships.map((sponsorship) => (
                  <TableRow
                    key={sponsorship.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <TableCell className="text-center align-middle py-4">
                      <Checkbox />
                    </TableCell>

                    <TableCell className="align-middle py-4">
                      <Link
                        to={`/admin/sponsor-profile/${sponsorship.sponsorId}`}
                        className="font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                      >
                        {getSponsorDisplayName(sponsorship)}
                      </Link>
                      {sponsorship.sponsor?.email && (
                        <div className="text-xs text-gray-500 mt-1">
                          {sponsorship.sponsor.email}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      {getSponsorshipType(sponsorship)}
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      <span className="font-medium">
                        {getSponsorshipAmount(sponsorship)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      {getStatusBadge(sponsorship.status)}
                    </TableCell>

                    <TableCell className="text-center align-middle py-4">
                      <div className="flex gap-2 justify-center">
                        <Button size="icon" variant="ghost" title="Delete">
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Edit">
                          <Pencil className="w-5 h-5 text-gray-600 dark:text-white" />
                        </Button>
                        <Button size="icon" variant="ghost" title="View">
                          <Eye className="w-5 h-5 text-gray-600 dark:text-white" />
                        </Button>
                        <Button size="icon" variant="ghost" title="More">
                          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-white" />
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
        {filteredSponsorships.length > 0 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSponsorships.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default SponsorshipOfferedTable;
