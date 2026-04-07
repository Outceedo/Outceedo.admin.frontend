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
import {
  Search,
  Loader2,
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
  Building,
} from "lucide-react";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
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

interface Sponsor {
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
  profilePicture?: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  birthYear?: number;
  city?: string;
  country?: string;
  address?: string;
  bio?: string;
  profession?: string;
  subProfession?: string;
  company?: string;
  companyName?: string;
  companyLink?: string;
  sponsorType?: string;
  budgetRange?: string;
  sponsorshipBudget?: number;
  sponsorshipType?: string;
  sponsorshipCountryPreferred?: string;
  language?: string[];
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
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const itemsPerPage = 7;
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Calculate pagination based on filtered data
  const paginatedSponsors = filteredSponsors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Search sponsors using the global search API
  const searchSponsors = async (query: string, page: number) => {
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
            limit: itemsPerPage,
            role: "sponsor",
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
        setSponsors(searchResults);
        setFilteredSponsors(searchResults);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Error searching sponsors:", err);
      setError(err.response?.data?.message || "Failed to search sponsors");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // Fetch sponsors data
  const fetchSponsors = async (page: number = 1) => {
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
            page: page,
            limit: itemsPerPage,
          },
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "api-key": adminToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.data) {
        setSponsors(response.data.data);
        setFilteredSponsors(response.data.data);
        setTotalPages(
          response.data.totalPages ||
            Math.ceil(
              (response.data.total || response.data.data.length) / itemsPerPage,
            ),
        );
      } else {
        setSponsors([]);
        setFilteredSponsors([]);
        setTotalPages(1);
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
          err.response?.data?.message || "Failed to fetch sponsors data",
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
    fetchSponsors(1);
  }, []);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchSponsors(debouncedSearchTerm, 1);
      setCurrentPage(1);
    } else {
      fetchSponsors(currentPage);
    }
  }, [debouncedSearchTerm]);

  // Handle page changes (only when not searching)
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      fetchSponsors(currentPage);
    }
  }, [currentPage]);

  // Filter sponsors by month (client-side filter on current results)
  useEffect(() => {
    let filtered = sponsors;

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((sponsor) => {
        const sponsorMonth = new Date(sponsor.createdAt).toLocaleDateString(
          "en-US",
          { month: "long" },
        );
        return sponsorMonth === selectedMonth;
      });
    }

    setFilteredSponsors(filtered);
  }, [sponsors, selectedMonth]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (debouncedSearchTerm.trim()) {
      searchSponsors(debouncedSearchTerm, page);
    }
  };

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

  const handleRowClick = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setShowSponsorModal(true);
  };

  const closeSponsorModal = () => {
    setShowSponsorModal(false);
    setSelectedSponsor(null);
  };

  const handleActionComplete = () => {
    if (debouncedSearchTerm.trim()) {
      searchSponsors(debouncedSearchTerm, currentPage);
    } else {
      fetchSponsors(currentPage);
    }
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
            {isSearching ? (
              <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : (
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
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
                  <TableRow
                    key={sponsor.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleRowClick(sponsor)}
                  >
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="text-center align-middle"
                    >
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
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="text-center align-middle"
                    >
                      <div className="flex gap-1 sm:gap-2 justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRowClick(sponsor)}
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                        </Button>
                        <Link to={`/admin/sponsor/edit/${sponsor.id}`}>
                          <Button size="icon" variant="ghost">
                            <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRowClick(sponsor)}
                        >
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
          onPageChange={handlePageChange}
        />
      </div>

      {/* Sponsor Detail Modal */}
      {showSponsorModal && selectedSponsor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {selectedSponsor.photo || selectedSponsor.profilePicture ? (
                  <img
                    src={
                      selectedSponsor.photo || selectedSponsor.profilePicture
                    }
                    alt={getFullName(selectedSponsor)}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {getFullName(selectedSponsor)}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedSponsor.username
                      ? `@${selectedSponsor.username}`
                      : selectedSponsor.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/admin/sponsor/edit/${selectedSponsor.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <button
                  onClick={closeSponsorModal}
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
                        {selectedSponsor.email || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedSponsor.mobileNumber ||
                          selectedSponsor.phoneNumber ||
                          "-"}
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
                        {selectedSponsor.city || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Country:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.country || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Address:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.address || "-"}
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
                        {selectedSponsor.age || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Birth Year:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.birthYear || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Gender:
                      </span>
                      <span className="dark:text-white capitalize">
                        {selectedSponsor.gender || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" /> Company Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Company:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.company ||
                          selectedSponsor.companyName ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Website:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.companyLink || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Sponsor Type:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.sponsorType || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sponsorship Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Sponsorship Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Type:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.sponsorshipType || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Budget:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.sponsorshipBudget
                          ? `£${selectedSponsor.sponsorshipBudget.toLocaleString()}`
                          : selectedSponsor.budgetRange || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Preferred Country:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.sponsorshipCountryPreferred || "-"}
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
                          selectedSponsor.stripeCustomerId
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedSponsor.stripeCustomerId ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Joined:
                      </span>
                      <span className="dark:text-white">
                        {formatDate(selectedSponsor.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Updated:
                      </span>
                      <span className="dark:text-white">
                        {selectedSponsor.updatedAt
                          ? formatDate(selectedSponsor.updatedAt)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedSponsor.bio && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedSponsor.bio}
                  </p>
                </div>
              )}

              {/* Languages */}
              {selectedSponsor.language &&
                selectedSponsor.language.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSponsor.language.map((lang, idx) => (
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
              {selectedSponsor.socialLinks && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Social Links
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedSponsor.socialLinks.instagram && (
                      <a
                        href={
                          selectedSponsor.socialLinks.instagram.startsWith(
                            "http",
                          )
                            ? selectedSponsor.socialLinks.instagram
                            : `https://instagram.com/${selectedSponsor.socialLinks.instagram}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                      >
                        <Instagram className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedSponsor.socialLinks.instagram}
                        </span>
                      </a>
                    )}
                    {selectedSponsor.socialLinks.facebook && (
                      <a
                        href={
                          selectedSponsor.socialLinks.facebook.startsWith(
                            "http",
                          )
                            ? selectedSponsor.socialLinks.facebook
                            : `https://facebook.com/${selectedSponsor.socialLinks.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedSponsor.socialLinks.facebook}
                        </span>
                      </a>
                    )}
                    {selectedSponsor.socialLinks.twitter && (
                      <a
                        href={
                          selectedSponsor.socialLinks.twitter.startsWith("http")
                            ? selectedSponsor.socialLinks.twitter
                            : `https://twitter.com/${selectedSponsor.socialLinks.twitter}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sky-500 hover:text-sky-600"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedSponsor.socialLinks.twitter}
                        </span>
                      </a>
                    )}
                    {selectedSponsor.socialLinks.linkedin && (
                      <a
                        href={
                          selectedSponsor.socialLinks.linkedin.startsWith(
                            "http",
                          )
                            ? selectedSponsor.socialLinks.linkedin
                            : `https://linkedin.com/in/${selectedSponsor.socialLinks.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedSponsor.socialLinks.linkedin}
                        </span>
                      </a>
                    )}
                    {!selectedSponsor.socialLinks.instagram &&
                      !selectedSponsor.socialLinks.facebook &&
                      !selectedSponsor.socialLinks.twitter &&
                      !selectedSponsor.socialLinks.linkedin && (
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
                      {selectedSponsor.referralCode || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referred By:
                    </span>
                    <p className="font-mono dark:text-white">
                      {selectedSponsor.referredBy || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referrals (Free/Paid):
                    </span>
                    <p className="dark:text-white">
                      {selectedSponsor.referredFree?.length || 0} /{" "}
                      {selectedSponsor.referredPaid?.length || 0}
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
                  userId={selectedSponsor.id}
                  userEmail={selectedSponsor.email}
                  username={selectedSponsor.username}
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

export default Sponsor;
