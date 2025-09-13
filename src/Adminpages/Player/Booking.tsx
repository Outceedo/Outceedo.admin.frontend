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
} from "lucide-react";

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
  description?: string | null;
  location?: string | null;
  meetLink?: string | null;
  meetingRecording?: string | null;
  recordedVideo?: string | null;
  paymentIntentId: string;
  paymentIntentClientSecret: string;
  playerMarkedComplete: boolean;
  expertMarkedComplete: boolean;
  agora?: any | null;
};

const Booking = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("All Months");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalBookings, setTotalBookings] = useState(0);

  const pageSize = 10;
  const totalPages = Math.ceil(totalBookings / pageSize);

  const fetchBookings = async (page: number) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${
          import.meta.env.VITE_PORT || "http://localhost:3000"
        }/player/bookings`,
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
        setBookings(response.data);
        // Estimate total bookings for pagination
        if (response.data.length < pageSize && page === 1) {
          setTotalBookings(response.data.length);
        } else if (response.data.length < pageSize) {
          setTotalBookings((page - 1) * pageSize + response.data.length);
        } else {
          setTotalBookings(page * pageSize + 1);
        }
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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
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
    return `${durationMinutes}m`;
  };

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
          <h2 className="text-xl sm:text-2xl font-semibold">Booking Experts</h2>
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
        <h2 className="text-xl sm:text-2xl font-semibold">Booking Experts</h2>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <select
            className="border px-3 py-2 rounded-md bg-white font-medium text-gray-700 w-full sm:w-40"
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
                <TableHead className="min-w-[150px]">Player ID</TableHead>
                <TableHead className="min-w-[150px]">Expert ID</TableHead>
                <TableHead className="min-w-[180px]">Booking Details</TableHead>
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
                    className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TableCell className="px-4 py-3 align-middle">
                      <Checkbox />
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <Link
                        to={`/player-profile/${booking.playerId}`}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        Player
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {booking.playerId.substring(0, 8)}...
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <Link
                        to={`/expert-profile/${booking.expertId}`}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        Expert
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {booking.expertId.substring(0, 8)}...
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
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {getBookingDuration(booking.startAt, booking.endAt)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.timezone}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {formatTime(booking.startAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {formatTime(booking.endAt)}
                        </div>
                        {booking.location && (
                          <div className="text-xs text-gray-600">
                            📍 {booking.location}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <div className="font-semibold text-lg">
                        £{booking.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.paymentIntentId ? "Paid" : "Pending"}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 align-middle">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <div className="mt-1 space-y-1">
                        {booking.playerMarkedComplete && (
                          <div className="text-xs text-green-600">
                            ✓ Player Complete
                          </div>
                        )}
                        {booking.expertMarkedComplete && (
                          <div className="text-xs text-green-600">
                            ✓ Expert Complete
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
                          {booking.meetingRecording && (
                            <div className="text-xs text-gray-500 mt-1">
                              Recording
                            </div>
                          )}
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

                    <TableCell className="px-4 py-3 align-middle">
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
            Showing{" "}
            {Math.min(
              (currentPage - 1) * pageSize + 1,
              filteredBookings.length
            )}
            –{Math.min(currentPage * pageSize, filteredBookings.length)} out of{" "}
            {totalBookings}
          </div>

          <div className="flex gap-1">
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

export default Booking;
