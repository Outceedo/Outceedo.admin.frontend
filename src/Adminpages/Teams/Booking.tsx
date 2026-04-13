import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

import {
  FileText,
  FileX2,
  Trash2,
  Edit2,
  Eye,
  MoreHorizontal,
  Loader2,
  Calendar,
  Clock,
  X,
  User,
  MapPin,
  DollarSign,
  Video,
  ExternalLink,
  Users,
} from "lucide-react";

// Service type mapping
const SERVICE_TYPES: Record<string, string> = {
  "1": "RECORDED VIDEO ASSESSMENT",
  "2": "ONLINE TRAINING",
  "3": "ON GROUND ASSESSMENT",
  "4": "ON GROUND TRAINING",
};

// Define booking type based on your actual API response
type BookingType = {
  id: string;
  playerId: string;
  expertId: string;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
  startAt: string;
  endAt: string;
  status: string;
  price: number;
  timezone: string;
  expertTimeZone?: string;
  playerName: string | null;
  expertName: string | null;
  description?: string | null;
  location?: string | null;
  meetLink?: string | null;
  meetingRecording?: string | null;
  recordedVideo?: string | null;
  paymentIntentId: string | null;
  paymentIntentClientSecret: string | null;
  playerMarkedComplete: boolean;
  expertMarkedComplete: boolean;
  agora?: any | null;
  expert?: {
    id: string;
    username: string;
    photo?: string | null;
  };
  player?: {
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
};

const TeamBooking = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("All Months");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  const pageSize = 10;

  const fetchBookings = async (page: number) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${import.meta.env.VITE_PORT || "http://localhost:3000"}/team/bookings`,
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
        },
      );

      if (response.status === 200 && response.data) {
        // Handle new API response format: { bookings, page, totalPages }
        const bookingsData = response.data.bookings || response.data.data || [];
        const pages = response.data.totalPages || 1;
        const currentPageNum = response.data.page || page;

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setTotalPages(pages);
        setCurrentPage(currentPageNum);
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);

      if (error.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (error.response?.status === 400) {
        setError("Invalid request parameters.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to fetch bookings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMonths = () => {
      const monthList: string[] = [
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
    };

    fetchMonths();
  }, []);

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowClick = (booking: BookingType) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SCHEDULED":
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
      case "WAITING_EXPERT_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "RESCHEDULE_REQUESTED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingDuration = (startAt: string, endAt: string) => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    if (durationMinutes >= 60) {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return durationMinutes > 0 ? `${durationMinutes}m` : "N/A";
  };

  const getServiceTypeName = (booking: BookingType) => {
    if (booking.service?.service?.name) {
      return booking.service.service.name.replace(/_/g, " ");
    }
    if (booking.service?.serviceId) {
      return SERVICE_TYPES[booking.service.serviceId] || "Service";
    }
    return "Service";
  };

  const getPlayerName = (booking: BookingType) => {
    return (
      booking.playerName ||
      booking.player?.username ||
      `Player ${booking.playerId.substring(0, 8)}...`
    );
  };

  const getExpertName = (booking: BookingType) => {
    return (
      booking.expertName ||
      booking.expert?.username ||
      `Expert ${booking.expertId.substring(0, 8)}...`
    );
  };

  // Filter bookings by month (client-side filter on current page results)
  const filteredBookings = bookings.filter((booking) => {
    if (selectedMonth === "All Months") return true;

    const bookingMonth = new Date(booking.startAt).toLocaleDateString("en-US", {
      month: "long",
    });
    return bookingMonth === selectedMonth;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Team Bookings</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Team Bookings ({filteredBookings.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <select
            className="border px-3 py-2 rounded-md bg-white dark:bg-gray-900 font-medium text-gray-700 dark:text-white w-full sm:w-40"
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
            onClick={() => fetchBookings(currentPage)}
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

      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="min-w-[150px]">Team</TableHead>
                <TableHead className="min-w-[150px]">Expert</TableHead>
                <TableHead className="min-w-[180px]">Service</TableHead>
                <TableHead className="min-w-[120px]">Schedule</TableHead>
                <TableHead className="min-w-[100px]">Price</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Reports</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    {selectedMonth !== "All Months"
                      ? "No bookings found for the selected month"
                      : "No bookings found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleRowClick(booking)}
                  >
                    <TableCell
                      className="px-4 py-3 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox />
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        {booking.player?.photo ? (
                          <img
                            src={booking.player.photo}
                            alt={getPlayerName(booking)}
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
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getPlayerName(booking)}
                          </Link>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        {booking.expert?.photo ? (
                          <img
                            src={booking.expert.photo}
                            alt={getExpertName(booking)}
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
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getExpertName(booking)}
                          </Link>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {getServiceTypeName(booking)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {getBookingDuration(booking.startAt, booking.endAt)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span className="text-sm font-medium">
                            {formatDate(booking.startAt)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(booking.startAt)} -{" "}
                          {formatTime(booking.endAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.timezone}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <div className="font-semibold text-lg">
                        ${booking.price?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.paymentIntentId ? "Paid" : "Pending"}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {booking.status?.replace(/_/g, " ")}
                      </span>
                      <div className="mt-1 space-y-1">
                        {booking.playerMarkedComplete && (
                          <div className="text-xs text-green-600">
                            Player Complete
                          </div>
                        )}
                        {booking.expertMarkedComplete && (
                          <div className="text-xs text-green-600">
                            Expert Complete
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      {booking.meetingRecording || booking.recordedVideo ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700 dark:text-white text-sm">
                              Available
                            </span>
                          </div>
                          {booking.recordedVideo && (
                            <div className="text-xs text-gray-500 mt-1">
                              Video
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileX2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            No Reports
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell
                      className="px-4 py-3 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1">
                        <button
                          className="text-red-600 hover:bg-red-50 rounded-full p-2"
                          title="Delete booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:bg-blue-50 rounded-full p-2"
                          title="Edit booking"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:bg-gray-100 rounded-full p-2"
                          title="View details"
                          onClick={() => handleRowClick(booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:bg-gray-100 rounded-full p-2"
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
      </div>

      {/* Pagination */}
      {bookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
          <div>
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex gap-1">
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
                <Badge
                  className={`text-sm px-3 py-1 ${getStatusColor(selectedBooking.status)}`}
                >
                  {selectedBooking.status?.replace(/_/g, " ")}
                </Badge>
                {selectedBooking.paymentIntentId && (
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                )}
              </div>

              {/* Service Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  {getServiceTypeName(selectedBooking)}
                </h3>
                {selectedBooking.service?.service?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBooking.service.service.description}
                  </p>
                )}
              </div>

              {/* Player & Expert Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Player Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Team
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
                        {getPlayerName(selectedBooking)}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {selectedBooking.playerId}
                      </p>
                    </div>
                  </div>
                </div>

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
                        {getExpertName(selectedBooking)}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {selectedBooking.expertId}
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
                        {getBookingDuration(
                          selectedBooking.startAt,
                          selectedBooking.endAt,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Timezone:</span>{" "}
                      <span className="dark:text-white">
                        {selectedBooking.timezone}
                      </span>
                    </div>
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
                        <span className="text-xs font-mono dark:text-white">
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
                <div className="flex gap-4">
                  <div
                    className={`flex items-center gap-2 ${selectedBooking.playerMarkedComplete ? "text-green-600" : "text-gray-400"}`}
                  >
                    {selectedBooking.playerMarkedComplete ? "✓" : "○"} Team
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

export default TeamBooking;
