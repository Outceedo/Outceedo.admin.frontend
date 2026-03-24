import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, Ban, ShieldOff, RefreshCw } from "lucide-react";
import { getBannedUsers, unbanUser, BannedUser } from "@/services/banService";

const BannedUsers: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState<BannedUser[]>([]);

  useEffect(() => {
    fetchBannedUsers();
  }, []);

  const fetchBannedUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getBannedUsers();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch banned users");
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (userId: string) => {
    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      await unbanUser(userId);
      setSuccess("User unbanned successfully");
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unban user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ban className="w-6 h-6 text-red-500" />
            Banned Users
          </h1>
          <p className="text-gray-600 mt-1">Manage permanently banned users</p>
        </div>
        <Button onClick={fetchBannedUsers} variant="outline" disabled={loading}>
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
          <Ban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No banned users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>User ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Banned
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnban(user.id)}
                      disabled={actionLoading === user.id}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      {actionLoading === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <ShieldOff className="w-4 h-4 mr-1" />
                      )}
                      Unban
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Total: {users.length} banned user{users.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default BannedUsers;
