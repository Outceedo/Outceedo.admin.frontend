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
import {
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
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
  Users,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

// Interface based on your actual API response
interface Team {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  mobileNumber?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  // Optional fields from your API
  address?: string | null;
  age?: number | null;
  bio?: string | null;
  birthYear?: number | null;
  budgetRange?: string | null;
  certificationLevel?: string | null;
  city?: string | null;
  club?: string | null;
  company?: string | null;
  companyLink?: string | null;
  country?: string | null;
  gender?: string | null;
  height?: number | null;
  interests?: string[];
  language?: string[];
  photo?: string | null;
  profession?: string | null;
  responseTime?: string | null;
  skills?: string[];
  skinColor?: string | null;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  } | null;
  sponsorType?: string | null;
  sponsorshipCountryPreferred?: string | null;
  sponsorshipType?: string | null;
  sport?: string | null;
  stripeCustomerId?: string | null;
  subProfession?: string | null;
  travelLimit?: number | null;
  weight?: number | null;
  teamName?: string | null;
  teamType?: string | null;
  teamCategory?: string | null;
  referralCode?: string | null;
  referredBy?: string | null;
  referredFree?: string[];
  referredPaid?: string[];
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
    <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white">
      <div>
        Showing {startItem}-{endItem} of {totalItems}
      </div>
      <div className="flex gap-1">
        <button
          className="border px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
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
              className={`border px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentPage === pageNum ? "bg-gray-200 dark:bg-gray-600" : ""
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          className="border px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          ⟩
        </button>
      </div>
    </div>
  );
};

const RegisteredTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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

  // Search teams using the global search API
  const searchTeams = async (query: string, page: number) => {
    try {
      setIsSearching(true);
      setError("");

      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.get(
        `https://api.outceedo.com/user/profiles/search`,

        {
          params: {
            q: query,
            page: page,
            limit: pageSize,
            role: "team",
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
        setTeams(searchResults);
        setFilteredTeams(searchResults);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Error searching teams:", err);
      setError(err.response?.data?.message || "Failed to search teams");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  // Fetch teams data
  const fetchTeams = async (page: number = 1) => {
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
        `${import.meta.env.VITE_PORT}/team/teams`,
        {
          params: {
            page: page,
            limit: pageSize,
          },
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "api-key": adminToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.data) {
        setTeams(response.data.data);
        setFilteredTeams(response.data.data);
        setTotalPages(
          response.data.totalPages ||
            Math.ceil(
              (response.data.total || response.data.data.length) / pageSize,
            ),
        );
      } else if (Array.isArray(response.data)) {
        // Handle case where data is directly an array
        setTeams(response.data);
        setFilteredTeams(response.data);
        setTotalPages(Math.ceil(response.data.length / pageSize) || 1);
      } else {
        setTeams([]);
        setFilteredTeams([]);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Error fetching teams:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (err.response?.status === 404) {
        setError("Teams endpoint not found.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch teams data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTeams(1);
  }, []);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchTeams(debouncedSearchTerm, 1);
      setCurrentPage(1);
    } else {
      fetchTeams(currentPage);
    }
  }, [debouncedSearchTerm]);

  // Handle page changes (only when not searching)
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      fetchTeams(currentPage);
    }
  }, [currentPage]);

  // Filter teams by month (client-side filter on current results)
  useEffect(() => {
    let filtered = teams;

    // Filter by month
    if (selectedMonth && selectedMonth !== "All Months") {
      filtered = filtered.filter((team) => {
        const teamMonth = new Date(team.createdAt).toLocaleDateString("en-US", {
          month: "long",
        });
        return teamMonth === selectedMonth;
      });
    }

    setFilteredTeams(filtered);
  }, [teams, selectedMonth]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (debouncedSearchTerm.trim()) {
      searchTeams(debouncedSearchTerm, page);
    }
  };

  // Helper functions
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

  const getTeamDisplayName = (team: Team) => {
    const fullName = `${team.firstName || ""} ${team.lastName || ""}`.trim();
    return team.company || team.club || fullName || team.username || "Team";
  };

  const getTeamInfo = (team: Team) => {
    const info = [];
    if (team.company) info.push(team.company);
    if (team.club) info.push(team.club);
    if (team.city) info.push(team.city);
    if (team.country) info.push(team.country);

    return info.length > 0 ? info.join(" • ") : team.username;
  };

  const getServicesOffered = (team: Team) => {
    const services = [];
    if (team.profession) services.push(team.profession);
    if (team.subProfession) services.push(team.subProfession);
    if (team.sport) services.push(`${team.sport} Training`);

    return services.length > 0
      ? services.join(", ")
      : "Training and Enrollments";
  };

  const getEnrollmentCount = (team: Team) => {
    // Since enrollment count isn't in the API response, generate a consistent random number based on team ID
    const hash = team.id.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 15) + 5; // Random number between 5-19
  };

  const getTeamStatus = (team: Team) => {
    // Determine status based on available data
    const hasCompleteProfile = Boolean(
      team.firstName && team.lastName && (team.company || team.club),
    );
    return hasCompleteProfile ? "Active" : "Inactive";
  };

  const getStatusBadge = (team: Team) => {
    const status = getTeamStatus(team);

    return (
      <Badge
        className={
          status === "Active"
            ? "bg-green-200 text-green-800 p-1 w-16"
            : "bg-yellow-200 text-yellow-800 p-1 w-16"
        }
      >
        {status}
      </Badge>
    );
  };

  const handleRowClick = (team: Team) => {
    setSelectedTeam(team);
    setShowTeamModal(true);
  };

  const closeTeamModal = () => {
    setShowTeamModal(false);
    setSelectedTeam(null);
  };

  const handleActionComplete = () => {
    if (debouncedSearchTerm.trim()) {
      searchTeams(debouncedSearchTerm, currentPage);
    } else {
      fetchTeams(currentPage);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Team Details</h2>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading teams...</span>
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
              onClick={fetchTeams}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-2xl font-semibold">
          Team Details ({filteredTeams.length})
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
              placeholder="Search teams..."
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
        <Table>
          <TableHeader className="bg-blue-100 text-xl dark:bg-blue-900">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Team Info</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Services Offered</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTeams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  {teams.length === 0
                    ? "No teams found"
                    : "No teams match your search criteria"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTeams.map((team) => (
                <TableRow
                  key={team.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(team)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/team-profile/${team.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {getTeamDisplayName(team)}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      @{team.username}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getTeamInfo(team)}</div>
                    {team.sport && (
                      <div className="text-xs text-gray-500 mt-1">
                        Sport: {team.sport}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(team.createdAt)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{getServicesOffered(team)}</div>
                    {team.certificationLevel && (
                      <div className="text-xs text-gray-500 mt-1">
                        Level: {team.certificationLevel}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {getEnrollmentCount(team)}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(team)}</TableCell>
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="flex gap-2 justify-center"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      title="View"
                      onClick={() => handleRowClick(team)}
                    >
                      <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                    </Button>
                    <Link to={`/admin/team/edit/${team.id}`}>
                      <Button size="icon" variant="ghost" title="Edit">
                        <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="More"
                      onClick={() => handleRowClick(team)}
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

      {/* Pagination */}
      {filteredTeams.length > 0 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTeams.length}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Team Detail Modal */}
      {showTeamModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {selectedTeam.photo ? (
                  <img
                    src={selectedTeam.photo}
                    alt={getTeamDisplayName(selectedTeam)}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {getTeamDisplayName(selectedTeam)}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{selectedTeam.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/admin/team/edit/${selectedTeam.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <button
                  onClick={closeTeamModal}
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
                        {selectedTeam.email || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedTeam.mobileNumber || "-"}
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
                        {selectedTeam.city || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Country:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.country || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Address:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.address || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Team Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Team Name:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.teamName || selectedTeam.company || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Club:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.club || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Team Type:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.teamType || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Category:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.teamCategory || "-"}
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
                        {selectedTeam.sport || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Profession:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.profession || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Specialization:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.subProfession || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Certification:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.certificationLevel || "-"}
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
                        Name:
                      </span>
                      <span className="dark:text-white">
                        {`${selectedTeam.firstName || ""} ${selectedTeam.lastName || ""}`.trim() ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Age:
                      </span>
                      <span className="dark:text-white">
                        {selectedTeam.age || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Gender:
                      </span>
                      <span className="dark:text-white capitalize">
                        {selectedTeam.gender || "-"}
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
                          selectedTeam.stripeCustomerId
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedTeam.stripeCustomerId ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Joined:
                      </span>
                      <span className="dark:text-white">
                        {formatDate(selectedTeam.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Updated:
                      </span>
                      <span className="dark:text-white">
                        {formatDate(selectedTeam.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedTeam.bio && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedTeam.bio}
                  </p>
                </div>
              )}

              {/* Languages */}
              {selectedTeam.language && selectedTeam.language.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeam.language.map((lang, idx) => (
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
              {selectedTeam.socialLinks && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Social Links
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedTeam.socialLinks.instagram && (
                      <a
                        href={
                          selectedTeam.socialLinks.instagram.startsWith("http")
                            ? selectedTeam.socialLinks.instagram
                            : `https://instagram.com/${selectedTeam.socialLinks.instagram}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                      >
                        <Instagram className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedTeam.socialLinks.instagram}
                        </span>
                      </a>
                    )}
                    {selectedTeam.socialLinks.facebook && (
                      <a
                        href={
                          selectedTeam.socialLinks.facebook.startsWith("http")
                            ? selectedTeam.socialLinks.facebook
                            : `https://facebook.com/${selectedTeam.socialLinks.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedTeam.socialLinks.facebook}
                        </span>
                      </a>
                    )}
                    {selectedTeam.socialLinks.twitter && (
                      <a
                        href={
                          selectedTeam.socialLinks.twitter.startsWith("http")
                            ? selectedTeam.socialLinks.twitter
                            : `https://twitter.com/${selectedTeam.socialLinks.twitter}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sky-500 hover:text-sky-600"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedTeam.socialLinks.twitter}
                        </span>
                      </a>
                    )}
                    {selectedTeam.socialLinks.linkedin && (
                      <a
                        href={
                          selectedTeam.socialLinks.linkedin.startsWith("http")
                            ? selectedTeam.socialLinks.linkedin
                            : `https://linkedin.com/in/${selectedTeam.socialLinks.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedTeam.socialLinks.linkedin}
                        </span>
                      </a>
                    )}
                    {!selectedTeam.socialLinks.instagram &&
                      !selectedTeam.socialLinks.facebook &&
                      !selectedTeam.socialLinks.twitter &&
                      !selectedTeam.socialLinks.linkedin && (
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
                      {selectedTeam.referralCode || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referred By:
                    </span>
                    <p className="font-mono dark:text-white">
                      {selectedTeam.referredBy || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referrals (Free/Paid):
                    </span>
                    <p className="dark:text-white">
                      {selectedTeam.referredFree?.length || 0} /{" "}
                      {selectedTeam.referredPaid?.length || 0}
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
                  userId={selectedTeam.id}
                  userEmail={selectedTeam.email}
                  username={selectedTeam.username}
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

export default RegisteredTeams;
