import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, FileX2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

// Interface based on your actual API response
interface ExpertBooking {
  id: string;
  playerId: string;
  expertId: string;
  serviceId: string;
  price: number;
  status: string;
  startAt: string;
  endAt: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  // Optional fields from your API response
  agora?: any | null;
  description?: string | null;
  location?: string | null;
  meetLink?: string | null;
  meetingRecording?: string | null;
  recordedVideo?: string | null;
  paymentIntentClientSecret?: string;
  paymentIntentId?: string;
  expertMarkedComplete: boolean;
  playerMarkedComplete: boolean;
  // Relations (if included in your API response)
  player?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
  };
  expert?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
  };
  service?: {
    id: string;
    name?: string;
    description?: string;
    type?: string;
  };
}

const ExpertBooking: React.FC = () => {
  const [bookings, setBookings] = useState<ExpertBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<ExpertBooking[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;
  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusOptions = [
    "All Status",
    "SCHEDULED",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "PENDING",
  ];

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

  // Fetch expert bookings
  const fetchExpertBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/player/bookings`,
        {
          params: {
            page: 1,
            limit: 1000, // Get all data for client-side pagination
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "api-key": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          setBookings(response.data.data);
          setFilteredBookings(response.data.data);
        } else if (Array.isArray(response.data)) {
          // Handle direct array response
          setBookings(response.data);
          setFilteredBookings(response.data);
        } else {
          setBookings([]);
          setFilteredBookings([]);
        }
      } else {
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (error: any) {
      console.error("Error fetching expert bookings:", error);

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (error.response?.status === 404) {
        setError("Expert bookings endpoint not found.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          error.response?.data?.message || "Failed to fetch expert bookings"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search, status, and month
  useEffect(() => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((booking) => {
        const expertName = booking.expert
          ? `${booking.expert.firstName || ""} ${
              booking.expert.lastName || ""
            }`.trim() ||
            booking.expert.username ||
            booking.expert.email ||
            booking.expertId
          : booking.expertId;

        const playerName = booking.player
          ? `${booking.player.firstName || ""} ${
              booking.player.lastName || ""
            }`.trim() ||
            booking.player.username ||
            booking.player.email ||
            booking.playerId
          : booking.playerId;

        const serviceName = booking.service?.name || "Service";

        return (
          expertName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== "All Status") {
      filtered = filtered.filter(
        (booking) =>
          booking.status.toUpperCase() === selectedStatus.toUpperCase()
      );
    }

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((booking) => {
        const bookingMonth = new Date(booking.startAt).toLocaleDateString(
          "en-US",
          { month: "long" }
        );
        return bookingMonth === selectedMonth;
      });
    }

    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [bookings, searchTerm, selectedStatus, selectedMonth]);

  useEffect(() => {
    fetchExpertBookings();
  }, []);

  // Helper functions
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Not specified";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Not specified";
    }
  };

  const getExpertDisplayName = (booking: ExpertBooking) => {
    if (booking.expert) {
      const fullName = `${booking.expert.firstName || ""} ${
        booking.expert.lastName || ""
      }`.trim();
      return (
        fullName ||
        booking.expert.username ||
        booking.expert.email ||
        "Unknown Expert"
      );
    }
    return `Expert ${booking.expertId.substring(0, 8)}...`;
  };

  const getPlayerDisplayName = (booking: ExpertBooking) => {
    if (booking.player) {
      const fullName = `${booking.player.firstName || ""} ${
        booking.player.lastName || ""
      }`.trim();
      return (
        fullName ||
        booking.player.username ||
        booking.player.email ||
        "Unknown Player"
      );
    }
    return `Player ${booking.playerId.substring(0, 8)}...`;
  };

  const getServiceName = (booking: ExpertBooking) => {
    if (booking.service) {
      return booking.service.name || booking.service.description || "Service";
    }
    return "Expert Service";
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    let className = "w-20 p-2";

    switch (statusUpper) {
      case "COMPLETED":
        className += " bg-green-200 text-green-800";
        break;
      case "SCHEDULED":
      case "CONFIRMED":
        className += " bg-blue-200 text-blue-800";
        break;
      case "PENDING":
        className += " bg-yellow-200 text-yellow-800";
        break;
      case "CANCELLED":
        className += " bg-red-200 text-red-800";
        break;
      default:
        className += " bg-gray-200 text-gray-800";
    }

    return <Badge className={className}>{status}</Badge>;
  };

  const getPaymentStatus = (booking: ExpertBooking) => {
    const hasPaymentIntent = Boolean(booking.paymentIntentId);
    const isCompleted = booking.status.toUpperCase() === "COMPLETED";

    if (isCompleted && hasPaymentIntent) {
      return { text: "Paid", color: "text-green-600" };
    } else if (hasPaymentIntent) {
      return { text: "Processing", color: "text-blue-600" };
    } else {
      return { text: "Pending", color: "text-yellow-600" };
    }
  };

  const hasReport = (booking: ExpertBooking) => {
    // Check if both expert and player marked complete, or if there's a recorded video/meeting recording
    return (
      (booking.expertMarkedComplete && booking.playerMarkedComplete) ||
      Boolean(booking.recordedVideo || booking.meetingRecording)
    );
  };

  const getBookingDuration = (booking: ExpertBooking) => {
    try {
      const start = new Date(booking.startAt);
      const end = new Date(booking.endAt);
      const durationMs = end.getTime() - start.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">Expert Bookings</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading expert bookings...</span>
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
              onClick={fetchExpertBookings}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          Expert Bookings ({filteredBookings.length})
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64 dark:bg-slate-600 dark:text-white rounded-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search bookings..."
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
              <TableHead></TableHead>
              <TableHead>Expert Name</TableHead>
              <TableHead>Player Name</TableHead>
              <TableHead>Service Request</TableHead>
              <TableHead>Service Fee</TableHead>
              <TableHead>Service Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  {bookings.length === 0
                    ? "No expert bookings found"
                    : "No bookings match your search criteria"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/admin/expert-profile/${booking.expertId}`}
                      className="text-blue-600 underline font-medium hover:text-blue-800"
                    >
                      {getExpertDisplayName(booking)}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {booking.expertId.substring(0, 8)}...
                    </div>
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/admin/player-profile/${booking.playerId}`}
                      className="text-blue-600 underline font-medium hover:text-blue-800"
                    >
                      {getPlayerDisplayName(booking)}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {booking.playerId.substring(0, 8)}...
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium">
                      {getServiceName(booking)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Duration: {getBookingDuration(booking)}
                    </div>
                    {booking.timezone && (
                      <div className="text-xs text-gray-500">
                        {booking.timezone}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold">
                        £{booking.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-sm ${getPaymentStatus(booking).color}`}
                      >
                        {getPaymentStatus(booking).text}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatDate(booking.startAt)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateTime(booking.startAt)} -{" "}
                      {formatDateTime(booking.endAt).split(" ").pop()}
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(booking.status)}</TableCell>

                  <TableCell className="px-4 py-2">
                    {hasReport(booking) ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.expertMarkedComplete &&
                          booking.playerMarkedComplete
                            ? "Complete"
                            : "Partial"}
                        </div>
                      </div>
                    ) : (
                      <FileX2 className="w-5 h-5 text-gray-400" />
                    )}
                  </TableCell>

                  <TableCell className="flex gap-2 justify-center">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm text-gray-500 dark:text-white">
          <div className="text-center sm:text-left w-full sm:w-auto">
            Showing{" "}
            {Math.min(
              (currentPage - 1) * pageSize + 1,
              filteredBookings.length
            )}
            –{Math.min(currentPage * pageSize, filteredBookings.length)} of{" "}
            {filteredBookings.length}
          </div>

          <div className="flex flex-wrap justify-center gap-1 w-full sm:w-auto">
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                    currentPage === pageNum ? "bg-gray-300 font-semibold" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              ⟩
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertBooking;
