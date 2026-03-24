import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2, RotateCcw, RefreshCw, AlertTriangle } from "lucide-react";
import { getDeletedUsers, restoreUser, permanentDeleteUser, DeletedUser } from "@/services/banService";

const DeletedUsers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState<DeletedUser[]>([]);

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDeletedUsers();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch deleted users");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (userId: string) => {
    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      await restoreUser(userId);
      setSuccess("User restored successfully");
      setUsers(users.filter((u) => u.userId !== userId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to restore user");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete ${username}? This action cannot be undone!`)) {
      return;
    }
    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      await permanentDeleteUser(userId);
      setSuccess("User permanently deleted");
      setUsers(users.filter((u) => u.userId !== userId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to permanently delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-gray-500" />
            Deleted Users
          </h1>
          <p className="text-gray-600 mt-1">
            Manage soft-deleted users. Users can be restored within 30 days of deletion.
          </p>
        </div>
        <Button onClick={fetchDeletedUsers} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No deleted users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>User ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Deleted At</TableHead>
                <TableHead>Restoration Window</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const daysRemaining = getDaysRemaining(user.expiresAt);
                const canRestore = user.canRestore && daysRemaining > 0;

                return (
                  <TableRow key={user.userId}>
                    <TableCell className="font-mono text-sm">{user.userId.slice(0, 8)}...</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.reason || "-"}</TableCell>
                    <TableCell>{formatDate(user.deletedAt)}</TableCell>
                    <TableCell>
                      {canRestore ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Expired
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {canRestore && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(user.userId)}
                            disabled={actionLoading === user.userId}
                            className="border-green-500 text-green-600 hover:bg-green-50"
                          >
                            {actionLoading === user.userId ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <RotateCcw className="w-4 h-4 mr-1" />
                            )}
                            Restore
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePermanentDelete(user.userId, user.username)}
                          disabled={actionLoading === user.userId}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          {actionLoading === user.userId ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 mr-1" />
                          )}
                          Delete Forever
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Total: {users.length} deleted user{users.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default DeletedUsers;
