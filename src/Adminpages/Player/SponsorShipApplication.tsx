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
import { Edit2, Eye, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface SponsorApplication {
  id: string;
  playerId: string;
  sponsorId: string;
  applicationDate: string;
  type: "MONETARY" | "PRODUCT";
  allocatedDate?: string | null;
  amount?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  // Add any other fields that your API returns
}

const SponsorShipApplication: React.FC = () => {
  const [applications, setApplications] = useState<SponsorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const totalPages = Math.ceil(totalItems / pageSize);

  const fetchSponsorshipApplications = async (page: number) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/player/sponsorships`,
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
        // Assuming the API returns an array directly or has a data field
        const sponsorshipData = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.applications || [];

        setApplications(sponsorshipData);

        // If your API returns pagination info, use it. Otherwise, estimate from response
        setTotalItems(sponsorshipData.length);
      }
    } catch (error: any) {
      console.error("Error fetching sponsorship applications:", error);

      if (error.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (error.response?.status === 400) {
        setError("Invalid request parameters.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to fetch sponsorship applications. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsorshipApplications(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-800 p-1 w-20 text-xs sm:text-sm";
      case "REJECTED":
        return "bg-red-100 text-red-800 p-1 w-20 text-xs sm:text-sm";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800 p-1 w-20 text-xs sm:text-sm";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: string | null) => {
    if (!amount) return "N/A";
    // If amount already includes currency symbol, return as is
    if (amount.includes("£") || amount.includes("$")) return amount;
    // Otherwise, add £ symbol
    return `£${amount}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Sponsorship Applications
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Sponsorship Applications
        </h2>
        <Button
          onClick={() => fetchSponsorshipApplications(currentPage)}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Player ID</TableHead>
              <TableHead>Sponsor ID</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead>Sponsorship Type</TableHead>
              <TableHead>Allocated Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  No sponsorship applications found
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app, index) => (
                <TableRow key={app.id} className="border-b last:border-b-0">
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <Checkbox />
                  </TableCell>

                  {/* Player ID */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <Link
                      to={`/player-profile/${app.playerId}`}
                      className="font-medium text-xs sm:text-sm md:text-base text-blue-600 underline hover:opacity-80"
                    >
                      Player
                    </Link>
                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {app.playerId.substring(0, 8)}...
                    </div>
                  </TableCell>

                  {/* Sponsor ID */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <Link
                      to={`/sponsor-profile/${app.sponsorId}`}
                      className="font-medium text-xs sm:text-sm md:text-base text-blue-600 underline hover:opacity-80"
                    >
                      Sponsor
                    </Link>
                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {app.sponsorId.substring(0, 8)}...
                    </div>
                  </TableCell>

                  {/* Application Date */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <span className="text-xs sm:text-sm">
                      {formatDate(app.applicationDate || app.createdAt)}
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <span className="text-xs sm:text-sm capitalize">
                      {app.type.toLowerCase()}
                    </span>
                  </TableCell>

                  {/* Allocated Date */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <span className="text-xs sm:text-sm">
                      {app.allocatedDate
                        ? formatDate(app.allocatedDate)
                        : "Not allocated"}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle font-semibold">
                    <span className="text-xs sm:text-sm">
                      {formatAmount(app.amount)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <Badge className={getStatusBadgeClass(app.status)}>
                      {app.status}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        className="text-red-600 hover:bg-red-50 rounded-full p-1"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-700 hover:bg-blue-50 rounded-full p-1 dark:text-white"
                        title="Edit application"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-700 hover:bg-gray-100 rounded-full p-1 dark:text-white"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-700 hover:bg-gray-100 rounded-full p-1 dark:text-white"
                        title="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {applications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
          <div className="text-center sm:text-left w-full sm:w-auto">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, applications.length)}–
            {Math.min(currentPage * pageSize, applications.length)} of{" "}
            {totalItems}
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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
                  className={`border px-3 py-1 rounded hover:bg-gray-100 ${
                    currentPage === pageNum
                      ? "bg-blue-100 font-semibold border-blue-300"
                      : ""
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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

export default SponsorShipApplication;
