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

// Interface based on your SponsorApplication model
interface SponsorApplication {
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

const Playersrequest: React.FC = () => {
  const [applications, setApplications] = useState<SponsorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    SponsorApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const statusOptions = [
    "All Status",
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "ACTIVE",
    "INACTIVE",
  ];

  // Fetch sponsor applications
  const fetchSponsorApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/sponsor/applications`,
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
        setApplications(response.data.data);
        setFilteredApplications(response.data.data);
      } else {
        setApplications([]);
        setFilteredApplications([]);
      }
    } catch (error: any) {
      console.error("Error fetching sponsor applications:", error);

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (error.response?.status === 404) {
        setError("Sponsor applications endpoint not found.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to fetch sponsor applications"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter applications based on search, status, and month
  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((app) => {
        const sponsorName = app.sponsor
          ? `${app.sponsor.firstName || ""} ${
              app.sponsor.lastName || ""
            }`.trim() ||
            app.sponsor.companyName ||
            app.sponsor.email ||
            app.sponsorId
          : app.sponsorId;

        const playerName = app.player
          ? `${app.player.firstName || ""} ${
              app.player.lastName || ""
            }`.trim() ||
            app.player.email ||
            app.playerId
          : app.playerId;

        return (
          sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== "All Status") {
      filtered = filtered.filter(
        (app) => app.status.toUpperCase() === selectedStatus.toUpperCase()
      );
    }

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((app) => {
        const appMonth = new Date(app.createdAt).toLocaleDateString("en-US", {
          month: "long",
        });
        return appMonth === selectedMonth;
      });
    }

    setFilteredApplications(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [applications, searchTerm, selectedStatus, selectedMonth]);

  useEffect(() => {
    fetchSponsorApplications();
  }, []);

  // Helper functions
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getSponsorDisplayName = (application: SponsorApplication) => {
    if (application.sponsor) {
      const fullName = `${application.sponsor.firstName || ""} ${
        application.sponsor.lastName || ""
      }`.trim();
      return (
        fullName ||
        application.sponsor.companyName ||
        application.sponsor.email ||
        "Unknown Sponsor"
      );
    }
    return `Sponsor ${application.sponsorId.substring(0, 8)}...`;
  };

  const getPlayerDisplayName = (application: SponsorApplication) => {
    if (application.player) {
      const fullName = `${application.player.firstName || ""} ${
        application.player.lastName || ""
      }`.trim();
      return fullName || application.player.email || "Unknown Player";
    }
    return `Player ${application.playerId.substring(0, 8)}...`;
  };

  const getSponsorInfo = (application: SponsorApplication) => {
    if (application.sponsor) {
      return (
        application.sponsor.email ||
        application.sponsor.companyName ||
        "No additional info"
      );
    }
    return application.sponsorId.substring(0, 12) + "...";
  };

  const getPlayerInfo = (application: SponsorApplication) => {
    if (application.player) {
      return application.player.email || "No additional info";
    }
    return application.playerId.substring(0, 12) + "...";
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    let className = "px-2 py-1 w-20 text-xs sm:text-sm mx-auto rounded";

    switch (statusUpper) {
      case "ACCEPTED":
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

  const getSponsorshipType = (application: SponsorApplication) => {
    return application.sponsorshipType || "Not specified";
  };

  if (loading) {
    return (
      <div className="p-2 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Player's Request
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            Loading sponsor applications...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-2 sm:p-6">
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertDescription className="text-red-800 dark:text-red-400">
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={fetchSponsorApplications}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Player's Request
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
              />
            </div>

            <select
              className="border px-3 py-2 rounded-md dark:bg-gray-900 w-full sm:w-auto"
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
              className="border px-3 py-2 rounded-md dark:bg-gray-900 w-full sm:w-auto"
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

        <div className="rounded-lg border overflow-x-auto bg-white dark:bg-gray-800 shadow-sm">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
              <TableRow>
                <TableHead className="w-10 text-center"></TableHead>
                <TableHead className="min-w-[180px] text-left">
                  Sponsors Name
                </TableHead>
                <TableHead className="min-w-[180px] text-left">
                  Players Name
                </TableHead>
                <TableHead className="min-w-[130px] text-center">
                  Request Date
                </TableHead>
                <TableHead className="min-w-[150px] text-center">
                  Sponsorship Type
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
              {paginatedApplications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    {applications.length === 0
                      ? "No sponsor applications found"
                      : "No applications match your search criteria"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="text-center align-middle">
                      <Checkbox />
                    </TableCell>

                    <TableCell className="align-middle">
                      <div>
                        <div className="font-medium text-blue-600 underline">
                          <Link to={`/admin/sponsor-profile/${app.sponsorId}`}>
                            {getSponsorDisplayName(app)}
                          </Link>
                        </div>
                        <div className="text-xs text-gray-500">
                          {getSponsorInfo(app)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-middle">
                      <div>
                        <div className="font-medium text-blue-600 underline">
                          <Link to={`/admin/player-profile/${app.playerId}`}>
                            {getPlayerDisplayName(app)}
                          </Link>
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPlayerInfo(app)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      {formatDate(app.applicationDate || app.createdAt)}
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      {getSponsorshipType(app)}
                      {app.amount && (
                        <div className="text-xs text-gray-500">
                          £{app.amount.toLocaleString()}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      {getStatusBadge(app.status)}
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      <div className="flex gap-1 sm:gap-2 justify-center">
                        <Button size="icon" variant="ghost" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Edit">
                          <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                        </Button>
                        <Button size="icon" variant="ghost" title="View">
                          <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                        </Button>
                        <Button size="icon" variant="ghost" title="More">
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
        {filteredApplications.length > 0 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredApplications.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Playersrequest;
