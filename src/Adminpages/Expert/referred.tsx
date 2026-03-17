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
import { Search, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import axios from "axios";

interface PaidReferral {
  username: string;
  planName: string;
}

interface UserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  photo: string | null;
  city: string | null;
  country: string | null;
  profession: string | null;
  referralCode: string;
  referredFree: string[];
  referredPaid: PaidReferral[];
  referredBy: string | null;
}

const PLAN_EARNINGS: Record<string, number> = {
  "Pro Monthly": 1,
  "Pro Yearly": 10,
  Test: 0,
};

const ReferredExpert: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(`${import.meta.env.VITE_PORT}/expert`, {
        params: {
          page: 1,
          limit: 100,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "API-Key": token,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        // Filter only users with referrals
        const usersWithReferrals = data.filter(
          (user: UserData) =>
            (user.referredFree && user.referredFree.length > 0) ||
            (user.referredPaid && user.referredPaid.length > 0),
        );
        setUsers(usersWithReferrals);
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
        setError("Failed to fetch referral data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getFullName = (user: UserData) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.username;
  };

  const calculateEarnings = (paidReferrals: PaidReferral[]) => {
    if (!paidReferrals || paidReferrals.length === 0) return 0;

    return paidReferrals.reduce((total, referral) => {
      const earning = PLAN_EARNINGS[referral.planName] || 0;
      return total + earning;
    }, 0);
  };

  const toggleRowExpand = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const handleRowClick = (user: UserData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredUsers = users.filter((user) => {
    const fullName = getFullName(user);
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            Referral Details
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading referral data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Referral Details</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or referral code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full dark:bg-slate-700 text-sm sm:text-base"
            />
          </div>
          <Button onClick={() => fetchUsers()} variant="outline" size="sm">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Referrers
          </div>
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Free Referrals
          </div>
          <div className="text-2xl font-bold text-green-600">
            {users.reduce((sum, u) => sum + (u.referredFree?.length || 0), 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Paid Referrals
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {users.reduce((sum, u) => sum + (u.referredPaid?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg shadow-sm border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-blue-100 dark:bg-blue-900 text-xl">
            <TableRow>
              <TableHead className="w-5"></TableHead>
              <TableHead className="min-w-[180px]">Referrer</TableHead>
              <TableHead className="min-w-[120px]">Referral Code</TableHead>
              <TableHead className="min-w-[120px] text-center">
                Free Referrals
              </TableHead>
              <TableHead className="min-w-[120px] text-center">
                Paid Referrals
              </TableHead>
              <TableHead className="min-w-[120px] text-center">
                Earnings
              </TableHead>
              <TableHead className="min-w-[100px] text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm
                    ? "No referrers found matching your criteria"
                    : "No users with referrals found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleRowClick(user)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.photo ? (
                          <img
                            src={user.photo}
                            alt={getFullName(user)}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {getFullName(user).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <Link
                            to={`/expert-profile/${user.id}`}
                            className="text-blue-600 underline hover:text-blue-800 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getFullName(user)}
                          </Link>
                          <span className="text-xs text-gray-500">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 font-mono">
                        {user.referralCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800">
                        {user.referredFree?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-purple-100 text-purple-800">
                        {user.referredPaid?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-green-600">
                        £{calculateEarnings(user.referredPaid)}
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleRowExpand(user.id)}
                          title="Expand details"
                        >
                          {expandedRows.has(user.id) ? (
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="View details"
                          onClick={() => handleRowClick(user)}
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-white" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Details */}
                  {expandedRows.has(user.id) && (
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                      <TableCell colSpan={7} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Free Referrals */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                            <h4 className="font-semibold text-green-600 mb-2">
                              Free Referrals ({user.referredFree?.length || 0})
                            </h4>
                            {user.referredFree &&
                            user.referredFree.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {user.referredFree.map((username, idx) => (
                                  <Badge
                                    key={idx}
                                    className="bg-green-50 text-green-700 border border-green-200"
                                  >
                                    @{username}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No free referrals
                              </p>
                            )}
                          </div>

                          {/* Paid Referrals */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                            <h4 className="font-semibold text-purple-600 mb-2">
                              Paid Referrals ({user.referredPaid?.length || 0})
                            </h4>
                            {user.referredPaid &&
                            user.referredPaid.length > 0 ? (
                              <div className="space-y-2">
                                {user.referredPaid.map((referral, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded p-2"
                                  >
                                    <span className="text-sm">
                                      @{referral.username}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-purple-100 text-purple-800">
                                        {referral.planName}
                                      </Badge>
                                      <span className="text-sm font-semibold text-green-600">
                                        £{PLAN_EARNINGS[referral.planName] || 0}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No paid referrals
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Referral Details Modal */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Referral Details - {getFullName(selectedUser)}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-4 border-b dark:border-gray-700">
                {selectedUser.photo ? (
                  <img
                    src={selectedUser.photo}
                    alt={getFullName(selectedUser)}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-semibold">
                    {getFullName(selectedUser).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-lg">
                    {getFullName(selectedUser)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    @{selectedUser.username}
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 font-mono mt-1">
                    Code: {selectedUser.referralCode}
                  </Badge>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedUser.referredFree?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Free Referrals</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedUser.referredPaid?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Paid Referrals</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    £{calculateEarnings(selectedUser.referredPaid)}
                  </div>
                  <div className="text-xs text-gray-500">Total Earnings</div>
                </div>
              </div>

              {/* Free Referrals List */}
              <div>
                <h4 className="font-semibold text-green-600 mb-2">
                  Free Referrals ({selectedUser.referredFree?.length || 0})
                </h4>
                {selectedUser.referredFree &&
                selectedUser.referredFree.length > 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.referredFree.map((username, idx) => (
                        <Badge
                          key={idx}
                          className="bg-green-100 text-green-800 border border-green-200"
                        >
                          @{username}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    No free referrals yet
                  </p>
                )}
              </div>

              {/* Paid Referrals List */}
              <div>
                <h4 className="font-semibold text-purple-600 mb-2">
                  Paid Referrals ({selectedUser.referredPaid?.length || 0})
                </h4>
                {selectedUser.referredPaid &&
                selectedUser.referredPaid.length > 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                    {selectedUser.referredPaid.map((referral, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-3 border"
                      >
                        <div>
                          <span className="font-medium">
                            @{referral.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-purple-100 text-purple-800">
                            {referral.planName}
                          </Badge>
                          <span className="font-semibold text-green-600">
                            £{PLAN_EARNINGS[referral.planName] || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    No paid referrals yet
                  </p>
                )}
              </div>

              {/* Earnings Breakdown */}
              {selectedUser.referredPaid &&
                selectedUser.referredPaid.length > 0 && (
                  <div className="border-t pt-4 dark:border-gray-700">
                    <h4 className="font-semibold mb-2">Earnings Breakdown</h4>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Pro Monthly: £1 per referral</p>
                      <p>Pro Yearly: £10 per referral</p>
                      <p>Test: £0 per referral</p>
                    </div>
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Earnings:</span>
                        <span className="text-xl font-bold text-green-600">
                          £{calculateEarnings(selectedUser.referredPaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferredExpert;
