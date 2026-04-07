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
import { Edit2, Eye, Trash2, MoreHorizontal, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  photo: string | null;
  email: string;
  role: string;
  sport?: string;
  city?: string;
  country?: string;
}

interface SponsorInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  photo: string | null;
  email: string;
  role: string;
  company?: string;
  sponsorType?: string;
}

interface SponsorApplication {
  id: string;
  sponsorId: string;
  userId: string;
  reason: string;
  uniqueFactor: string;
  sponsorshipType: string;
  website: string;
  budget: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  additionalInfo: string;
  createdAt: string;
  updatedAt: string;
  user?: UserInfo;
  sponsor?: SponsorInfo;
}

const SponsorShipApplication: React.FC = () => {
  const [applications, setApplications] = useState<SponsorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<SponsorApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

  const handleRowClick = (app: SponsorApplication) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

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

  const getStatusBadgeClass = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "ACCEPTED":
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
              <TableHead>Player</TableHead>
              <TableHead>Sponsor</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead>Sponsorship Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No sponsorship applications found
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow
                  key={app.id}
                  className="border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(app)}
                >
                  <TableCell
                    className="px-2 sm:px-4 py-2 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox />
                  </TableCell>

                  {/* Player */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <Link
                      to={`/player-profile/${app.userId}`}
                      className="font-medium text-xs sm:text-sm md:text-base text-blue-600 underline hover:opacity-80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {app.user ? `${app.user.firstName} ${app.user.lastName}` : "Player"}
                    </Link>
                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {app.user?.username || app.userId?.substring(0, 8) + "..."}
                    </div>
                  </TableCell>

                  {/* Sponsor */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <Link
                      to={`/sponsor-profile/${app.sponsorId}`}
                      className="font-medium text-xs sm:text-sm md:text-base text-blue-600 underline hover:opacity-80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {app.sponsor?.company || `${app.sponsor?.firstName || ""} ${app.sponsor?.lastName || ""}`.trim() || "Sponsor"}
                    </Link>
                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {app.sponsor?.username || app.sponsorId?.substring(0, 8) + "..."}
                    </div>
                  </TableCell>

                  {/* Application Date */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <span className="text-xs sm:text-sm">
                      {formatDate(app.createdAt)}
                    </span>
                  </TableCell>

                  {/* Sponsorship Type */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <span className="text-xs sm:text-sm capitalize">
                      {app.sponsorshipType?.toLowerCase() ?? "N/A"}
                    </span>
                  </TableCell>

                  {/* Budget */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle font-semibold">
                    <span className="text-xs sm:text-sm">
                      {formatAmount(app.budget)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-2 sm:px-4 py-2 align-middle">
                    <Badge className={getStatusBadgeClass(app.status)}>
                      {app.status ?? "UNKNOWN"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="px-2 sm:px-4 py-2 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                        onClick={() => handleRowClick(app)}
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

      {/* Application Details Modal */}
      {isModalOpen && selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Application Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status:
                </span>
                <Badge className={getStatusBadgeClass(selectedApplication.status)}>
                  {selectedApplication.status}
                </Badge>
              </div>

              {/* Player Information Section */}
              {selectedApplication.user && (
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Player Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.user.firstName} {selectedApplication.user.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Username</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.user.username}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.user.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sport</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.user.sport || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {[selectedApplication.user.city, selectedApplication.user.country].filter(Boolean).join(", ") || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</label>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">
                        {selectedApplication.user.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sponsor Information Section */}
              {selectedApplication.sponsor && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">
                    Sponsor Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Company</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.sponsor.company || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Contact Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.sponsor.firstName} {selectedApplication.sponsor.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Username</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.sponsor.username}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedApplication.sponsor.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sponsor Type</label>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">
                        {selectedApplication.sponsor.sponsorType || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Details Section */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Application Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Application ID</label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono break-all">
                      {selectedApplication.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sponsorship Type</label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">
                      {selectedApplication.sponsorshipType}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Budget</label>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {formatAmount(selectedApplication.budget)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Website</label>
                    <a
                      href={selectedApplication.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all block"
                    >
                      {selectedApplication.website || "N/A"}
                    </a>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created At</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedApplication.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedApplication.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Full Width Fields */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Reason</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1 p-3 bg-white dark:bg-gray-800 rounded border">
                      {selectedApplication.reason || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Unique Factor</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1 p-3 bg-white dark:bg-gray-800 rounded border">
                      {selectedApplication.uniqueFactor || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Additional Info</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1 p-3 bg-white dark:bg-gray-800 rounded border">
                      {selectedApplication.additionalInfo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorShipApplication;
