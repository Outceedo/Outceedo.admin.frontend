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
import {
  Search,
  FileText,
  FileX2,
  Loader2,
  X,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Video,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

// Service type mapping
const SERVICE_TYPES: Record<string, string> = {
  "1": "RECORDED VIDEO ASSESSMENT",
  "2": "ONLINE TRAINING",
  "3": "ON GROUND ASSESSMENT",
  "4": "ON GROUND TRAINING",
};

// Interface based on your actual API response
interface ExpertBookingType {
  id: string;
  playerId: string;
  expertId: string;
  serviceId: string;
  price: number;
  status: string;
  startAt: string;
  endAt: string;
  timezone: string;
  expertTimeZone?: string;
  createdAt: string;
  updatedAt: string;
  playerName: string | null;
  expertName: string | null;
  agora?: any | null;
  description?: string | null;
  location?: string | null;
  meetLink?: string | null;
  meetingRecording?: string | null;
  recordedVideo?: string | null;
  paymentIntentClientSecret?: string | null;
  paymentIntentId?: string | null;
  expertMarkedComplete: boolean;
  playerMarkedComplete: boolean;
  player?: {
    id: string;
    username: string;
    photo?: string | null;
  };
  expert?: {
    id: string;
    username: string;
    photo?: string | null;
  };
  service?: {
    id: string;
    serviceId: string;
    price: number;
    service?: {
      id: string;
      name: string;
      description: string;
    };
  } | null;
}

const ExpertBooking: React.FC = () => {
  const [bookings, setBookings] = useState<ExpertBookingType[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<ExpertBookingType[]>(
    [],
  );
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] =
    useState<ExpertBookingType | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pageSize = 10;

  const statusOptions = [
    "All Status",
    "WAITING_EXPERT_APPROVAL",
    "ACCEPTED",
    "COMPLETED",
    "CANCELLED",
    "RESCHEDULE_REQUESTED",
    "REJECTED",
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

  // Fetch expert bookings with server-side pagination
  const fetchExpertBookings = async (page: number) => {
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
            page: page,
            limit: pageSize,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "api-key": token,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data) {
        // Handle new API response format: { bookings, page, totalPages }
        const bookingsData =
          response.data.bookings || response.data.data || [];
        const pages = response.data.totalPages || 1;
        const currentPageNum = response.data.page || page;

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setFilteredBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setTotalPages(pages);
        setCurrentPage(currentPageNum);
      } else {
        setBookings([]);
        setFilteredBookings([]);
        setTotalPages(1);
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
          error.response?.data?.message || "Failed to fetch expert bookings",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search, status, and month (client-side on current page)
  useEffect(() => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((booking) => {
        const expertName = getExpertDisplayName(booking);
        const playerName = getPlayerDisplayName(booking);
        const serviceName = getServiceName(booking);

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
          booking.status.toUpperCase() === selectedStatus.toUpperCase(),
      );
    }

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((booking) => {
        const bookingMonth = new Date(booking.startAt).toLocaleDateString(
          "en-US",
          { month: "long" },
        );
        return bookingMonth === selectedMonth;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, selectedStatus, selectedMonth]);

  useEffect(() => {
    fetchExpertBookings(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowClick = (booking: ExpertBookingType) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

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
        hour12: true,
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

  const getExpertDisplayName = (booking: ExpertBookingType) => {
    return (
      booking.expertName ||
      booking.expert?.username ||
      `Expert ${booking.expertId.substring(0, 8)}...`
    );
  };

  const getPlayerDisplayName = (booking: ExpertBookingType) => {
    return (
      booking.playerName ||
      booking.player?.username ||
      `Player ${booking.playerId.substring(0, 8)}...`
    );
  };

  const getServiceName = (booking: ExpertBookingType) => {
    if (booking.service?.service?.name) {
      return booking.service.service.name.replace(/_/g, " ");
    }
    if (booking.service?.serviceId) {
      return SERVICE_TYPES[booking.service.serviceId] || "Expert Service";
    }
    return "Expert Service";
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    let className = "px-2 py-1 text-xs";

    switch (statusUpper) {
      case "COMPLETED":
        className += " bg-green-200 text-green-800";
        break;
      case "SCHEDULED":
      case "ACCEPTED":
        className += " bg-blue-200 text-blue-800";
        break;
      case "WAITING_EXPERT_APPROVAL":
        className += " bg-yellow-200 text-yellow-800";
        break;
      case "CANCELLED":
      case "REJECTED":
        className += " bg-red-200 text-red-800";
        break;
      case "RESCHEDULE_REQUESTED":
        className += " bg-orange-200 text-orange-800";
        break;
      default:
        className += " bg-gray-200 text-gray-800";
    }

    return <Badge className={className}>{status.replace(/_/g, " ")}</Badge>;
  };

  const getPaymentStatus = (booking: ExpertBookingType) => {
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

  const hasReport = (booking: ExpertBookingType) => {
    return (
      (booking.expertMarkedComplete && booking.playerMarkedComplete) ||
      Boolean(booking.recordedVideo || booking.meetingRecording)
    );
  };

  const getBookingDuration = (booking: ExpertBookingType) => {
    try {
      const start = new Date(booking.startAt);
      const end = new Date(booking.endAt);
      const durationMs = end.getTime() - start.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return minutes > 0 ? `${minutes}m` : "N/A";
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
              onClick={() => fetchExpertBookings(currentPage)}
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
                {status.replace(/_/g, " ")}
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
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Expert</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredBookings.length === 0 ? (
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
                filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleRowClick(booking)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {booking.expert?.photo ? (
                          <img
                            src={booking.expert.photo}
                            alt={getExpertDisplayName(booking)}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/admin/expert-profile/${booking.expertId}`}
                            className="text-blue-600 underline font-medium hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getExpertDisplayName(booking)}
                          </Link>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {booking.player?.photo ? (
                          <img
                            src={booking.player.photo}
                            alt={getPlayerDisplayName(booking)}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/admin/player-profile/${booking.playerId}`}
                            className="text-blue-600 underline font-medium hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getPlayerDisplayName(booking)}
                          </Link>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium">
                        {getServiceName(booking)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Duration: {getBookingDuration(booking)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold">
                          ${booking.price?.toFixed(2) || "0.00"}
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
                        {booking.timezone}
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

                    <TableCell
                      className="flex gap-2 justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="icon" variant="ghost" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Edit">
                        <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="View"
                        onClick={() => handleRowClick(booking)}
                      >
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
      </div>

      {/* Pagination */}
      {bookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm text-gray-500 dark:text-white">
          <div className="text-center sm:text-left w-full sm:w-auto">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex flex-wrap justify-center gap-1 w-full sm:w-auto">
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Prev
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
                  className={`border px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currentPage === pageNum
                      ? "bg-blue-100 dark:bg-blue-900 font-semibold border-blue-300"
                      : ""
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold dark:text-white">
                  Booking Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {selectedBooking.id}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedBooking.status)}
                {selectedBooking.paymentIntentId && (
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                )}
              </div>

              {/* Service Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  {getServiceName(selectedBooking)}
                </h3>
                {selectedBooking.service?.service?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBooking.service.service.description}
                  </p>
                )}
              </div>

              {/* Player & Expert Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expert Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Expert
                  </h3>
                  <div className="flex items-center gap-3">
                    {selectedBooking.expert?.photo ? (
                      <img
                        src={selectedBooking.expert.photo}
                        alt="Expert"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium dark:text-white">
                        {getExpertDisplayName(selectedBooking)}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {selectedBooking.expertId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Player Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Player
                  </h3>
                  <div className="flex items-center gap-3">
                    {selectedBooking.player?.photo ? (
                      <img
                        src={selectedBooking.player.photo}
                        alt="Player"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium dark:text-white">
                        {getPlayerDisplayName(selectedBooking)}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {selectedBooking.playerId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schedule */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Schedule
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Start:</span>{" "}
                      <span className="dark:text-white">
                        {formatDateTime(selectedBooking.startAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">End:</span>{" "}
                      <span className="dark:text-white">
                        {formatDateTime(selectedBooking.endAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>{" "}
                      <span className="dark:text-white">
                        {getBookingDuration(selectedBooking)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Player Timezone:</span>{" "}
                      <span className="dark:text-white">
                        {selectedBooking.timezone}
                      </span>
                    </div>
                    {selectedBooking.expertTimeZone && (
                      <div>
                        <span className="text-gray-500">Expert Timezone:</span>{" "}
                        <span className="dark:text-white">
                          {selectedBooking.expertTimeZone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Payment */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Payment
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Price:</span>{" "}
                      <span className="text-lg font-bold dark:text-white">
                        ${selectedBooking.price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>{" "}
                      <span
                        className={
                          selectedBooking.paymentIntentId
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {selectedBooking.paymentIntentId ? "Paid" : "Pending"}
                      </span>
                    </div>
                    {selectedBooking.paymentIntentId && (
                      <div>
                        <span className="text-gray-500">Payment ID:</span>{" "}
                        <span className="text-xs font-mono dark:text-white break-all">
                          {selectedBooking.paymentIntentId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedBooking.description && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedBooking.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {selectedBooking.location && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedBooking.location}
                  </p>
                </div>
              )}

              {/* Media/Recordings */}
              {(selectedBooking.recordedVideo ||
                selectedBooking.meetingRecording ||
                selectedBooking.meetLink) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4" /> Media & Links
                  </h3>
                  <div className="space-y-2">
                    {selectedBooking.recordedVideo && (
                      <a
                        href={selectedBooking.recordedVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Recorded Video
                      </a>
                    )}
                    {selectedBooking.meetingRecording && (
                      <a
                        href={selectedBooking.meetingRecording}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Meeting Recording
                      </a>
                    )}
                    {selectedBooking.meetLink && (
                      <a
                        href={selectedBooking.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Meeting Link
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Completion Status */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Completion Status
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div
                    className={`flex items-center gap-2 ${selectedBooking.playerMarkedComplete ? "text-green-600" : "text-gray-400"}`}
                  >
                    {selectedBooking.playerMarkedComplete ? "✓" : "○"} Player
                    Marked Complete
                  </div>
                  <div
                    className={`flex items-center gap-2 ${selectedBooking.expertMarkedComplete ? "text-green-600" : "text-gray-400"}`}
                  >
                    {selectedBooking.expertMarkedComplete ? "✓" : "○"} Expert
                    Marked Complete
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
                <div>Created: {formatDateTime(selectedBooking.createdAt)}</div>
                <div>Updated: {formatDateTime(selectedBooking.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertBooking;
