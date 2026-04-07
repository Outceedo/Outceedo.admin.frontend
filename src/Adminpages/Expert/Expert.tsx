import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UserActions from "@/components/admin/UserActions";

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Expert {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  mobileNumber?: string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  photo?: string;
  age?: number;
  gender?: string;
  birthYear?: number;
  city?: string;
  country?: string;
  address?: string;
  bio?: string;
  profession?: string;
  subProfession?: string;
  certificationLevel?: string;
  company?: string;
  companyLink?: string;
  sport?: string;
  language?: string[];
  skills?: string[];
  interests?: string[];
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  stripeCustomerId?: string;
  referralCode?: string;
  referredBy?: string;
  referredFree?: string[];
  referredPaid?: string[];
}

const Expert: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Calculate pagination based on filtered data (for month filtering)
  const paginatedExperts = filteredExperts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Search experts using the global search API
  const searchExperts = async (query: string, page: number) => {
    try {
      setIsSearching(true);
      setError("");

      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_PORT || "http://localhost:3000"}/profile/search`,
        {
          params: {
            q: query,
            page: page,
            limit: pageSize,
            role: "expert",
          },
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "api-key": adminToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data) {
        const searchResults = response.data.users || response.data.data || [];
        setExperts(searchResults);
        setFilteredExperts(searchResults);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(searchResults.length);
      }
    } catch (err: any) {
      console.error("Error searching experts:", err);
      setError(err.response?.data?.message || "Failed to search experts");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // Fetch experts data (when no search term)
  const fetchExperts = async (page: number = 1) => {
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
          page: page,
          limit: pageSize,
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
        setTotalPages(
          response.data.totalPages ||
            Math.ceil(
              (response.data.total || response.data.data.length) / pageSize,
            ),
        );
        setTotalCount(response.data.total || response.data.data.length);
      } else {
        setExperts([]);
        setFilteredExperts([]);
        setTotalPages(1);
        setTotalCount(0);
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
    fetchExperts(1);
  }, []);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchExperts(debouncedSearchTerm, 1);
      setCurrentPage(1);
    } else {
      fetchExperts(currentPage);
    }
  }, [debouncedSearchTerm]);

  // Handle page changes (only when not searching)
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      fetchExperts(currentPage);
    }
  }, [currentPage]);

  // Filter experts by month (client-side filter on current results)
  useEffect(() => {
    let filtered = experts;

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((expert) => {
        const expertMonth = new Date(expert.createdAt).toLocaleDateString(
          "en-US",
          { month: "long" },
        );
        return expertMonth === selectedMonth;
      });
    }

    setFilteredExperts(filtered);
  }, [experts, selectedMonth]);

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

  const handleRowClick = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowExpertModal(true);
  };

  const closeExpertModal = () => {
    setShowExpertModal(false);
    setSelectedExpert(null);
  };

  const handleActionComplete = () => {
    if (debouncedSearchTerm.trim()) {
      searchExperts(debouncedSearchTerm, currentPage);
    } else {
      fetchExperts(currentPage);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (debouncedSearchTerm.trim()) {
      searchExperts(debouncedSearchTerm, page);
    }
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
            {isSearching ? (
              <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : (
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
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
                <TableRow
                  key={expert.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(expert)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="flex gap-2 justify-center"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRowClick(expert)}
                    >
                      <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                    </Button>
                    <Link to={`/admin/expert/edit/${expert.id}`}>
                      <Button size="icon" variant="ghost">
                        <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRowClick(expert)}
                    >
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
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
                className={`border px-2 rounded ${
                  currentPage === pageNum ? "bg-gray-300 dark:bg-gray-600" : ""
                }`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className="border px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
          >
            ⟩
          </button>
        </div>
      </div>

      {/* Expert Detail Modal */}
      {showExpertModal && selectedExpert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {selectedExpert.photo ? (
                  <img
                    src={selectedExpert.photo}
                    alt={getFullName(selectedExpert)}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {getFullName(selectedExpert)}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedExpert.username
                      ? `@${selectedExpert.username}`
                      : selectedExpert.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/admin/expert/edit/${selectedExpert.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <button
                  onClick={closeExpertModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Contact Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedExpert.email || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedExpert.mobileNumber || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        City:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.city || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Country:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.country || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Address:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.address || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Personal Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Age:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.age || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Birth Year:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.birthYear || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Gender:
                      </span>
                      <span className="dark:text-white capitalize">
                        {selectedExpert.gender || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Professional Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Profession:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.profession || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Specialization:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.subProfession || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Certification:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.certificationLevel || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Company:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.company || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Account Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Type:
                      </span>
                      <Badge
                        className={
                          selectedExpert.stripeCustomerId
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedExpert.stripeCustomerId ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Joined:
                      </span>
                      <span className="dark:text-white">
                        {formatDate(selectedExpert.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Updated:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.updatedAt
                          ? formatDate(selectedExpert.updatedAt)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sport Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Sport Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Sport:
                      </span>
                      <span className="dark:text-white">
                        {selectedExpert.sport || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedExpert.bio && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedExpert.bio}
                  </p>
                </div>
              )}

              {/* Languages */}
              {selectedExpert.language &&
                selectedExpert.language.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpert.language.map((lang, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="dark:border-gray-500"
                        >
                          {lang.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Social Links */}
              {selectedExpert.socialLinks && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Social Links
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedExpert.socialLinks.instagram && (
                      <a
                        href={
                          selectedExpert.socialLinks.instagram.startsWith(
                            "http",
                          )
                            ? selectedExpert.socialLinks.instagram
                            : `https://instagram.com/${selectedExpert.socialLinks.instagram}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                      >
                        <Instagram className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedExpert.socialLinks.instagram}
                        </span>
                      </a>
                    )}
                    {selectedExpert.socialLinks.facebook && (
                      <a
                        href={
                          selectedExpert.socialLinks.facebook.startsWith("http")
                            ? selectedExpert.socialLinks.facebook
                            : `https://facebook.com/${selectedExpert.socialLinks.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedExpert.socialLinks.facebook}
                        </span>
                      </a>
                    )}
                    {selectedExpert.socialLinks.twitter && (
                      <a
                        href={
                          selectedExpert.socialLinks.twitter.startsWith("http")
                            ? selectedExpert.socialLinks.twitter
                            : `https://twitter.com/${selectedExpert.socialLinks.twitter}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sky-500 hover:text-sky-600"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedExpert.socialLinks.twitter}
                        </span>
                      </a>
                    )}
                    {selectedExpert.socialLinks.linkedin && (
                      <a
                        href={
                          selectedExpert.socialLinks.linkedin.startsWith("http")
                            ? selectedExpert.socialLinks.linkedin
                            : `https://linkedin.com/in/${selectedExpert.socialLinks.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedExpert.socialLinks.linkedin}
                        </span>
                      </a>
                    )}
                    {!selectedExpert.socialLinks.instagram &&
                      !selectedExpert.socialLinks.facebook &&
                      !selectedExpert.socialLinks.twitter &&
                      !selectedExpert.socialLinks.linkedin && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No social links available
                        </span>
                      )}
                  </div>
                </div>
              )}

              {/* Referral Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Referral Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referral Code:
                    </span>
                    <p className="font-mono font-semibold dark:text-white">
                      {selectedExpert.referralCode || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referred By:
                    </span>
                    <p className="font-mono dark:text-white">
                      {selectedExpert.referredBy || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referrals (Free/Paid):
                    </span>
                    <p className="dark:text-white">
                      {selectedExpert.referredFree?.length || 0} /{" "}
                      {selectedExpert.referredPaid?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Actions */}
              <div className="border-t dark:border-gray-700 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  User Actions
                </h3>
                <UserActions
                  userId={selectedExpert.id}
                  userEmail={selectedExpert.email}
                  username={selectedExpert.username}
                  onActionComplete={handleActionComplete}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expert;
