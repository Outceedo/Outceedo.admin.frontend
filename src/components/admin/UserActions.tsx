import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Ban,
  Clock,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  ShieldOff,
  RotateCcw,
} from "lucide-react";
import {
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  softDeleteUser,
  permanentDeleteUser,
  checkBan,
  checkSuspend,
} from "@/services/banService";

interface UserActionsProps {
  userId: string;
  userEmail?: string;
  username?: string;
  onActionComplete?: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  userId,
  userEmail,
  username,
  onActionComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Status
  const [isBanned, setIsBanned] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendTill, setSuspendTill] = useState<string | null>(null);

  // Modals
  const [showBanModal, setShowBanModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form data
  const [banReason, setBanReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDate, setSuspendDate] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteType, setDeleteType] = useState<"soft" | "permanent">("soft");

  useEffect(() => {
    checkUserStatus();
  }, [userId]);

  const checkUserStatus = async () => {
    setCheckingStatus(true);
    try {
      const [banStatus, suspendStatus] = await Promise.all([
        checkBan(userId),
        checkSuspend(userId),
      ]);
      setIsBanned(banStatus.isBanned);
      setIsSuspended(suspendStatus.isSuspended);
      setSuspendTill(suspendStatus.suspendTill);
    } catch (err) {
      console.error("Error checking user status:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      setError("Please provide a reason for banning");
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      await banUser(userId, banReason);
      setSuccess("User banned successfully");
      setIsBanned(true);
      setShowBanModal(false);
      setBanReason("");
      onActionComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to ban user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    setLoading(true);
    clearMessages();
    try {
      await unbanUser(userId);
      setSuccess("User unbanned successfully");
      setIsBanned(false);
      onActionComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unban user");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      setError("Please provide a reason for suspension");
      return;
    }
    if (!suspendDate) {
      setError("Please select suspension end date");
      return;
    }
    const selectedDate = new Date(suspendDate);
    if (selectedDate <= new Date()) {
      setError("Suspension date must be in the future");
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      await suspendUser(userId, suspendReason, suspendDate);
      setSuccess("User suspended successfully");
      setIsSuspended(true);
      setSuspendTill(suspendDate);
      setShowSuspendModal(false);
      setSuspendReason("");
      setSuspendDate("");
      onActionComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to suspend user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setLoading(true);
    clearMessages();
    try {
      await unsuspendUser(userId);
      setSuccess("User unsuspended successfully");
      setIsSuspended(false);
      setSuspendTill(null);
      onActionComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unsuspend user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    clearMessages();
    try {
      if (deleteType === "soft") {
        await softDeleteUser(userId, deleteReason);
        setSuccess("User marked for deletion. Can be restored within 30 days.");
      } else {
        if (!confirm("This action is IRREVERSIBLE. Are you absolutely sure?")) {
          setLoading(false);
          return;
        }
        await permanentDeleteUser(userId);
        setSuccess("User permanently deleted");
      }
      setShowDeleteModal(false);
      setDeleteReason("");
      onActionComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Calculate minimum date for suspend (tomorrow)
  const getMinSuspendDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Checking user status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Display */}
      {(isBanned || isSuspended) && (
        <div className="flex flex-wrap gap-2">
          {isBanned && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
              <Ban className="w-3 h-3" /> Banned
            </span>
          )}
          {isSuspended && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Suspended until{" "}
              {suspendTill ? new Date(suspendTill).toLocaleDateString() : "N/A"}
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Ban/Unban */}
        {isBanned ? (
          <Button
            variant="outline"
            onClick={handleUnban}
            disabled={loading}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldOff className="w-4 h-4 mr-2" />}
            Unban User
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowBanModal(true)}
            disabled={loading}
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <Ban className="w-4 h-4 mr-2" />
            Ban User
          </Button>
        )}

        {/* Suspend/Unsuspend */}
        {isSuspended ? (
          <Button
            variant="outline"
            onClick={handleUnsuspend}
            disabled={loading}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
            Unsuspend User
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowSuspendModal(true)}
            disabled={loading}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <Clock className="w-4 h-4 mr-2" />
            Suspend User
          </Button>
        )}

        {/* Delete */}
        <Button
          variant="outline"
          onClick={() => setShowDeleteModal(true)}
          disabled={loading}
          className="border-gray-500 text-gray-600 hover:bg-gray-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete User
        </Button>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-500" />
                Ban User
              </h3>
              <button onClick={() => setShowBanModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Banning <strong>{username || userEmail || userId}</strong> will permanently restrict their access.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason for ban *</label>
                <Input
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for banning"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowBanModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBan} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Ban User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Suspend User
              </h3>
              <button onClick={() => setShowSuspendModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Suspending <strong>{username || userEmail || userId}</strong> will temporarily restrict their access.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason for suspension *</label>
                <Input
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter reason for suspension"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Suspend until *</label>
                <Input
                  type="datetime-local"
                  value={suspendDate}
                  onChange={(e) => setSuspendDate(e.target.value)}
                  min={getMinSuspendDate()}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSuspend} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Suspend User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-gray-700" />
                Delete User
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Delete Type</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="deleteType"
                      checked={deleteType === "soft"}
                      onChange={() => setDeleteType("soft")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Soft Delete</div>
                      <div className="text-sm text-gray-500">User can be restored within 30 days</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50">
                    <input
                      type="radio"
                      name="deleteType"
                      checked={deleteType === "permanent"}
                      onChange={() => setDeleteType("permanent")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Permanent Delete
                      </div>
                      <div className="text-sm text-red-600">This action cannot be undone!</div>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                <Input
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Enter reason for deletion"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={loading}
                  className={deleteType === "permanent" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-600 hover:bg-gray-700 text-white"}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {deleteType === "permanent" ? "Permanently Delete" : "Soft Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActions;
