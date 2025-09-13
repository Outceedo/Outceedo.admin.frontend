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
import { Link } from "react-router-dom";
import { Trash2, Eye, MoreHorizontal, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

interface User {
  id: string;
  name?: string;
  email: string;
  createdAt: string;
  // Add other user properties based on your UserProfile schema
  profilePicture?: string;
  isActive?: boolean;
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

  const pageSize = 10;
  const totalPages = Math.ceil(totalUsers / pageSize);

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
            "API-Key": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setUsers(response.data);
        // If your API returns total count, use it. Otherwise estimate from response
        if (response.data.length < pageSize && page === 1) {
          setTotalUsers(response.data.length);
        } else if (response.data.length < pageSize) {
          setTotalUsers((page - 1) * pageSize + response.data.length);
        } else {
          // Estimate total - you might want to add a separate count endpoint
          setTotalUsers(page * pageSize + 1);
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

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
        <Button
          onClick={() => fetchUsers(currentPage)}
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
                <TableRow key={user.id}>
                  <TableCell>
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
                        user.isActive ?? true
                      )}`}
                    >
                      {user.isActive ?? true ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Pencil className="w-4 h-4 text-gray-600 dark:text-white" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                      </Button>
                      <Button size="icon" variant="ghost">
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
              (currentPage - 1) * pageSize + users.length
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
    </div>
  );
};

export default Fanandfollowers;
