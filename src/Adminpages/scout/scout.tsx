import React, { useEffect, useState } from "react";
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
  Loader2,
  X,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Ruler,
  Weight,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import axios from "axios";
import UserActions from "@/components/admin/UserActions";

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

interface ScoutData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  age: number | null;
  bio: string | null;
  city: string | null;
  club: string | null;
  company: string | null;
  country: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  photo: string | null;
  profession: string | null;
  position: string | null;
  foot: string | null;
  sport: string | null;
  language: string[] | null;
  skills: any[];
  interests: any[];
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  } | null;
  stripeCustomerId: string | null;
  email: string | null;
  mobileNumber: string | null;
  birthYear: number | null;
  responseTime: string | null;
  travelLimit: string | null;
  certificationLevel: string | null;
  teamType: string | null;
  teamCategory: string | null;
  skinColor: string | null;
  address: string | null;
  referralCode: string | null;
  referredFree: string[];
  referredPaid: string[];
  referredBy: string | null;
  currency: string | null;
  teamName: string | null;
  budgetRange: string | null;
  sponsorshipType: string | null;
  sponsorshipCountryPreferred: string | null;
  companyLink: string | null;
  sponsorType: string | null;
}

const Scout: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [scouts, setScouts] = useState<ScoutData[]>([]);
  const [filteredScouts, setFilteredScouts] = useState<ScoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [totalScouts, setTotalScouts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedScout, setSelectedScout] = useState<ScoutData | null>(null);
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const searchScouts = async (query: string, page: number) => {
    try {
      setIsSearching(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const baseUrl =
        import.meta.env.VITE_PORT || "http://localhost:3000";
      const queryString = `q=${encodeURIComponent(query)}&page=${page}&limit=${pageSize}&role=scout`;

      const response = await axios.get(
        `${baseUrl}/profile/search?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "api-key": token,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data) {
        const searchResults = response.data.users || response.data.data || [];
        setScouts(searchResults);
        setFilteredScouts(searchResults);
        setTotalPages(response.data.totalPages || 1);
        setTotalScouts(searchResults.length);
      }
    } catch (err: any) {
      console.error("Error searching scouts:", err);
      setError(err.response?.data?.message || "Failed to search scouts");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const fetchScouts = async (page: number) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const baseUrl =
        import.meta.env.VITE_PORT || "http://localhost:3000";
      const queryString = `page=${page}&limit=${pageSize}`;

      const response = await axios.get(
        `${baseUrl}/scout/scouts?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "api-key": token,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data) {
        const scoutsData = response.data.data || response.data;
        const pages = response.data.totalPages || 1;
        const currentPageNum = response.data.page || page;

        setScouts(Array.isArray(scoutsData) ? scoutsData : []);
        setFilteredScouts(Array.isArray(scoutsData) ? scoutsData : []);
        setTotalPages(pages);
        setCurrentPage(currentPageNum);
        setTotalScouts(
          pages * pageSize > scoutsData.length
            ? pages * pageSize
            : scoutsData.length,
        );
      }
    } catch (error: any) {
      console.error("Error fetching scouts:", error);

      if (error.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (error.response?.status === 400) {
        setError("Invalid request parameters.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to fetch scouts. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
    setSelectedMonth("All Months");
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchScouts(debouncedSearchTerm, 1);
      setCurrentPage(1);
    } else {
      fetchScouts(currentPage);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      fetchScouts(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    let filtered = scouts;

    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((scout) => {
        const scoutMonth = new Date(scout.createdAt).toLocaleDateString(
          "en-US",
          { month: "long" },
        );
        return scoutMonth === selectedMonth;
      });
    }

    setFilteredScouts(filtered);
  }, [scouts, selectedMonth]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (debouncedSearchTerm.trim()) {
        searchScouts(debouncedSearchTerm, newPage);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getFullName = (scout: ScoutData) => {
    const firstName = scout.firstName || "";
    const lastName = scout.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || scout.username;
  };

  const getAccountType = (scout: ScoutData) => {
    return scout.stripeCustomerId ? "Premium" : "Free";
  };

  const getSubscriptionType = (scout: ScoutData): string => {
    return scout.stripeCustomerId ? "Pro" : "Free";
  };

  const handleRowClick = (scout: ScoutData) => {
    setSelectedScout(scout);
    setShowScoutModal(true);
  };

  const closeScoutModal = () => {
    setShowScoutModal(false);
    setSelectedScout(null);
  };

  const handleActionComplete = () => {
    if (debouncedSearchTerm.trim()) {
      searchScouts(debouncedSearchTerm, currentPage);
    } else {
      fetchScouts(currentPage);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">Scouts Details</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading scouts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Scouts Details</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
            <Input
              type="text"
              placeholder="Search by name or username"
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
          <Button
            onClick={() => fetchScouts(currentPage)}
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
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead className="w-5"></TableHead>
              <TableHead className="min-w-[160px]">Scout Name</TableHead>
              <TableHead className="min-w-[140px]">Registration Date</TableHead>
              <TableHead className="min-w-[160px]">Username</TableHead>
              <TableHead className="min-w-[100px]">Account Type</TableHead>
              <TableHead className="min-w-[100px]">Subscription</TableHead>
              <TableHead className="min-w-[130px]">Sport/Position</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[120px] text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredScouts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm || selectedMonth !== "All Months"
                    ? "No scouts found matching your criteria"
                    : "No scouts found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredScouts.map((scout) => (
                <TableRow
                  key={scout.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(scout)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {scout.photo && (
                        <img
                          src={scout.photo}
                          alt={getFullName(scout)}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="flex flex-col">
                        <Link
                          to={`/scout-profile/${scout.id}`}
                          className="text-blue-600 underline hover:text-blue-800 font-medium"
                        >
                          {getFullName(scout)}
                        </Link>
                        {scout.club && (
                          <span className="text-xs text-gray-500">
                            {scout.club}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(scout.createdAt)}</TableCell>
                  <TableCell>
                    <span className="font-medium">@{scout.username}</span>
                    {scout.country && (
                      <div className="text-xs text-gray-500">
                        {scout.country}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        getAccountType(scout) === "Premium"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getAccountType(scout)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          getSubscriptionType(scout) === "Yearly"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                    >
                      {getSubscriptionType(scout)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {scout.sport && (
                        <span className="font-medium text-sm">
                          {scout.sport}
                        </span>
                      )}
                      {scout.position && (
                        <span className="text-xs text-gray-500">
                          {scout.position}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-200 text-green-800 px-2 py-1 w-20 text-center">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRowClick(scout)}
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                      </Button>
                      <Link to={`/admin/scout/edit/${scout.id}`}>
                        <Button size="icon" variant="ghost">
                          <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRowClick(scout)}
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

      {scouts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500 dark:text-white">
          <div>
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, filteredScouts.length)}
            –{Math.min(currentPage * pageSize, filteredScouts.length)} of{" "}
            {totalScouts}
          </div>
          <div className="flex gap-1">
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className={`border px-3 py-1 rounded ${
                    currentPage === pageNum ? "bg-gray-300 font-semibold" : ""
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="border px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              ⟩
            </button>
          </div>
        </div>
      )}

      {showScoutModal && selectedScout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {selectedScout.photo ? (
                  <img
                    src={selectedScout.photo}
                    alt={getFullName(selectedScout)}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {getFullName(selectedScout)}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{selectedScout.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/admin/scout/edit/${selectedScout.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <button
                  onClick={closeScoutModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedScout.email || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedScout.mobileNumber || "-"}
                      </span>
                    </div>
                  </div>
                </div>

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
                        {selectedScout.city || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Country:
                      </span>
                      <span className="dark:text-white">
                        {selectedScout.country || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Address:
                      </span>
                      <span className="dark:text-white">
                        {selectedScout.address || "-"}
                      </span>
                    </div>
                  </div>
                </div>

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
                        {selectedScout.age || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Birth Year:
                      </span>
                      <span className="dark:text-white">
                        {selectedScout.birthYear || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Gender:
                      </span>
                      <span className="dark:text-white capitalize">
                        {selectedScout.gender || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> Physical Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedScout.height
                          ? `${selectedScout.height} cm`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedScout.weight
                          ? `${selectedScout.weight} kg`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

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
                        {selectedScout.sport || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Position:
                      </span>
                      <span className="dark:text-white">
                        {selectedScout.position || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Foot:
                      </span>
                      <span className="dark:text-white">
                        {selectedScout.foot
                          ? selectedScout.foot
                              .split("_")
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(" ")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Club:
                      </span>
                      <span className="dark:text-white">
                        {selectedScout.club || "-"}
                      </span>
                    </div>
                  </div>
                </div>

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
                          selectedScout.stripeCustomerId
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedScout.stripeCustomerId ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Joined:
                      </span>
                      <span className="dark:text-white">
                        {formatDate(selectedScout.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Updated:
                      </span>
                      <span className="dark:text-white">
                        {formatDate(selectedScout.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedScout.bio && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedScout.bio}
                  </p>
                </div>
              )}

              {selectedScout.language &&
                selectedScout.language.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedScout.language.map((lang, idx) => (
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

              {selectedScout.socialLinks && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Social Links
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedScout.socialLinks.instagram && (
                      <a
                        href={
                          selectedScout.socialLinks.instagram.startsWith("http")
                            ? selectedScout.socialLinks.instagram
                            : `https://instagram.com/${selectedScout.socialLinks.instagram}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                      >
                        <Instagram className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedScout.socialLinks.instagram}
                        </span>
                      </a>
                    )}
                    {selectedScout.socialLinks.facebook && (
                      <a
                        href={
                          selectedScout.socialLinks.facebook.startsWith("http")
                            ? selectedScout.socialLinks.facebook
                            : `https://facebook.com/${selectedScout.socialLinks.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedScout.socialLinks.facebook}
                        </span>
                      </a>
                    )}
                    {selectedScout.socialLinks.twitter && (
                      <a
                        href={
                          selectedScout.socialLinks.twitter.startsWith("http")
                            ? selectedScout.socialLinks.twitter
                            : `https://twitter.com/${selectedScout.socialLinks.twitter}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sky-500 hover:text-sky-600"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedScout.socialLinks.twitter}
                        </span>
                      </a>
                    )}
                    {selectedScout.socialLinks.linkedin && (
                      <a
                        href={
                          selectedScout.socialLinks.linkedin.startsWith("http")
                            ? selectedScout.socialLinks.linkedin
                            : `https://linkedin.com/in/${selectedScout.socialLinks.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedScout.socialLinks.linkedin}
                        </span>
                      </a>
                    )}
                    {!selectedScout.socialLinks.instagram &&
                      !selectedScout.socialLinks.facebook &&
                      !selectedScout.socialLinks.twitter &&
                      !selectedScout.socialLinks.linkedin && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No social links available
                        </span>
                      )}
                  </div>
                </div>
              )}

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
                      {selectedScout.referralCode || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referred By:
                    </span>
                    <p className="font-mono dark:text-white">
                      {selectedScout.referredBy || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referrals (Free/Paid):
                    </span>
                    <p className="dark:text-white">
                      {selectedScout.referredFree?.length || 0} /{" "}
                      {selectedScout.referredPaid?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  User Actions
                </h3>
                <UserActions
                  userId={selectedScout.id}
                  userEmail={selectedScout.email || undefined}
                  username={selectedScout.username}
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

export default Scout;
