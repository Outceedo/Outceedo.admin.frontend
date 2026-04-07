import { useState, useEffect } from "react";
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
import { Link } from "react-router-dom";
import {
  Trash2,
  Eye,
  MoreHorizontal,
  Pencil,
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
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
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

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  name?: string;
  email: string;
  mobileNumber?: string;
  createdAt: string;
  updatedAt?: string;
  profilePicture?: string;
  photo?: string;
  isActive?: boolean;
  age?: number;
  gender?: string;
  birthYear?: number;
  city?: string;
  country?: string;
  address?: string;
  bio?: string;
  profession?: string;
  subProfession?: string;
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

const statusClass = (isActive: boolean) =>
  isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Fanandfollowers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Search users using the global search API
  const searchUsers = async (query: string, page: number) => {
    try {
      setIsSearching(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
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
            role: "user",
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "api-key": token,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data) {
        const searchResults = response.data.users || response.data.data || [];
        setUsers(searchResults);
        setTotalPages(response.data.totalPages || 1);
        setTotalUsers(searchResults.length);
      }
    } catch (err: any) {
      console.error("Error searching users:", err);
      setError(err.response?.data?.message || "Failed to search users");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${import.meta.env.VITE_PORT}/user/users`,
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

      if (response.status === 200) {
        setUsers(response.data);
        // If your API returns total count, use it. Otherwise estimate from response
        if (response.data.length < pageSize && page === 1) {
          setTotalUsers(response.data.length);
          setTotalPages(1);
        } else if (response.data.length < pageSize) {
          setTotalUsers((page - 1) * pageSize + response.data.length);
          setTotalPages(page);
        } else {
          // Estimate total - you might want to add a separate count endpoint
          setTotalUsers(page * pageSize + 1);
          setTotalPages(page + 1);
        }
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);

      if (error.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (error.response?.status === 400) {
        setError("Invalid request parameters.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to fetch users. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchUsers(debouncedSearchTerm, 1);
      setCurrentPage(1);
    } else {
      fetchUsers(currentPage);
    }
  }, [debouncedSearchTerm]);

  // Handle page changes (only when not searching)
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      fetchUsers(currentPage);
    }
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (debouncedSearchTerm.trim()) {
        searchUsers(debouncedSearchTerm, newPage);
      }
    }
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleActionComplete = () => {
    if (debouncedSearchTerm.trim()) {
      searchUsers(debouncedSearchTerm, currentPage);
    } else {
      fetchUsers(currentPage);
    }
  };

  const getFullName = (user: User) => {
    if (user.name) return user.name;
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.username || user.email;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-semibold">Fans And Followers</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold">Fans And Followers</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
            <Input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
            />
          </div>
          <Button
            onClick={() => handleActionComplete()}
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
        <Table className="min-w-[800px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead />
              <TableHead>Fans/Follower Name's</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Interests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.profilePicture && (
                        <img
                          src={user.profilePicture}
                          alt={user.name || user.email}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <Link
                        to={`/player-profile/${user.id}`}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {user.name || user.email}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  {/* Comments */}
                  <TableCell>
                    <Link
                      to={`/admin/fan/comments/${user.id}`}
                      className="text-blue-600 underline text-sm hover:text-blue-800"
                    >
                      View
                    </Link>
                  </TableCell>
                  {/* Reviews */}
                  <TableCell>
                    <Link
                      to={`/admin/fan/reviews/${user.id}`}
                      className="text-blue-600 underline text-sm hover:text-blue-800"
                    >
                      View
                    </Link>
                  </TableCell>
                  {/* Interests */}
                  <TableCell>
                    <Link
                      to={`/admin/fan/interests/${user.id}`}
                      className="text-blue-600 underline text-sm hover:text-blue-800"
                    >
                      View
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-semibold ${statusClass(
                        user.isActive ?? true,
                      )}`}
                    >
                      {(user.isActive ?? true) ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRowClick(user)}
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                      </Button>
                      <Link to={`/admin/fan/edit/${user.id}`}>
                        <Button size="icon" variant="ghost">
                          <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRowClick(user)}
                      >
                        <MoreHorizontal className="w-4 h-4" />
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
      {users.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-sm text-gray-500">
          <div className="text-center sm:text-left w-full sm:w-auto">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(
              currentPage * pageSize,
              (currentPage - 1) * pageSize + users.length,
            )}{" "}
            of {totalUsers}
          </div>
          <div className="flex flex-wrap justify-center gap-1">
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

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {selectedUser.photo || selectedUser.profilePicture ? (
                  <img
                    src={selectedUser.photo || selectedUser.profilePicture}
                    alt={getFullName(selectedUser)}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {getFullName(selectedUser)}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedUser.username
                      ? `@${selectedUser.username}`
                      : selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/admin/fan/edit/${selectedUser.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <button
                  onClick={closeUserModal}
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
                        {selectedUser.email || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="dark:text-white">
                        {selectedUser.mobileNumber || "-"}
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
                        {selectedUser.city || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Country:
                      </span>
                      <span className="dark:text-white">
                        {selectedUser.country || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Address:
                      </span>
                      <span className="dark:text-white">
                        {selectedUser.address || "-"}
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
                        {selectedUser.age || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Birth Year:
                      </span>
                      <span className="dark:text-white">
                        {selectedUser.birthYear || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Gender:
                      </span>
                      <span className="dark:text-white capitalize">
                        {selectedUser.gender || "-"}
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
                        {selectedUser.profession || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Specialization:
                      </span>
                      <span className="dark:text-white">
                        {selectedUser.subProfession || "-"}
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
                          selectedUser.stripeCustomerId
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedUser.stripeCustomerId ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Joined:
                      </span>
                      <span className="dark:text-white">
                        {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Updated:
                      </span>
                      <span className="dark:text-white">
                        {selectedUser.updatedAt
                          ? formatDate(selectedUser.updatedAt)
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Account Status:
                      </span>
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-semibold ${statusClass(
                          selectedUser.isActive ?? true,
                        )}`}
                      >
                        {(selectedUser.isActive ?? true)
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {/* Languages */}
              {selectedUser.language && selectedUser.language.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.language.map((lang, idx) => (
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

              {/* Interests */}
              {selectedUser.interests && selectedUser.interests.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.interests.map((interest, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="dark:border-gray-500"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {selectedUser.socialLinks && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Social Links
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedUser.socialLinks.instagram && (
                      <a
                        href={
                          selectedUser.socialLinks.instagram.startsWith("http")
                            ? selectedUser.socialLinks.instagram
                            : `https://instagram.com/${selectedUser.socialLinks.instagram}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                      >
                        <Instagram className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedUser.socialLinks.instagram}
                        </span>
                      </a>
                    )}
                    {selectedUser.socialLinks.facebook && (
                      <a
                        href={
                          selectedUser.socialLinks.facebook.startsWith("http")
                            ? selectedUser.socialLinks.facebook
                            : `https://facebook.com/${selectedUser.socialLinks.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedUser.socialLinks.facebook}
                        </span>
                      </a>
                    )}
                    {selectedUser.socialLinks.twitter && (
                      <a
                        href={
                          selectedUser.socialLinks.twitter.startsWith("http")
                            ? selectedUser.socialLinks.twitter
                            : `https://twitter.com/${selectedUser.socialLinks.twitter}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sky-500 hover:text-sky-600"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedUser.socialLinks.twitter}
                        </span>
                      </a>
                    )}
                    {selectedUser.socialLinks.linkedin && (
                      <a
                        href={
                          selectedUser.socialLinks.linkedin.startsWith("http")
                            ? selectedUser.socialLinks.linkedin
                            : `https://linkedin.com/in/${selectedUser.socialLinks.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedUser.socialLinks.linkedin}
                        </span>
                      </a>
                    )}
                    {!selectedUser.socialLinks.instagram &&
                      !selectedUser.socialLinks.facebook &&
                      !selectedUser.socialLinks.twitter &&
                      !selectedUser.socialLinks.linkedin && (
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
                      {selectedUser.referralCode || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referred By:
                    </span>
                    <p className="font-mono dark:text-white">
                      {selectedUser.referredBy || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Referrals (Free/Paid):
                    </span>
                    <p className="dark:text-white">
                      {selectedUser.referredFree?.length || 0} /{" "}
                      {selectedUser.referredPaid?.length || 0}
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
                  userId={selectedUser.id}
                  userEmail={selectedUser.email}
                  username={selectedUser.username}
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

export default Fanandfollowers;
