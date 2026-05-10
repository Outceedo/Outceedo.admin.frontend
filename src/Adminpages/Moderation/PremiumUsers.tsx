import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Crown,
  Loader2,
  RefreshCw,
  Pencil,
  X,
  Save,
  Ban as RevokeIcon,
  Search,
} from "lucide-react";
import {
  listPremiumUsers,
  listPlans,
  grantPremium,
  revokePremium,
  PremiumRow,
  Plan,
} from "@/services/subscriptionService";

type RoleFilter = "all" | "player" | "team" | "scout";

const formatDateInput = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const todayInput = () => formatDateInput(new Date().toISOString());

const PremiumUsers: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rows, setRows] = useState<PremiumRow[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPlanId, setEditPlanId] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [premiumRes, plansList] = await Promise.all([
        listPremiumUsers(),
        listPlans(),
      ]);
      setRows(premiumRes.rows ?? []);
      setPlans(plansList ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load premium users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== "all" && r.user?.role !== roleFilter) return false;
      if (!q) return true;
      const haystack = [
        r.user?.username,
        r.user?.email,
        r.user?.firstName,
        r.user?.lastName,
        r.subscription.plan?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, roleFilter, search]);

  const startEdit = (row: PremiumRow) => {
    setEditingUserId(row.subscription.userId);
    setEditPlanId(row.subscription.planId);
    setEditStartDate(formatDateInput(row.subscription.startDate));
    setEditEndDate(formatDateInput(row.subscription.endDate));
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditPlanId("");
    setEditStartDate("");
    setEditEndDate("");
  };

  const saveEdit = async (userId: string) => {
    setError("");
    setSuccess("");
    if (!editPlanId) return setError("Please select a plan");
    if (!editStartDate || !editEndDate)
      return setError("Please pick start and end dates");
    const startMs = new Date(editStartDate).getTime();
    const endMs = new Date(editEndDate).getTime();
    if (startMs >= endMs) return setError("Start date must be before end date");
    if (endMs <= Date.now()) return setError("End date must be in the future");

    setActionLoading(userId);
    try {
      await grantPremium({
        userId,
        planId: editPlanId,
        startDate: new Date(editStartDate).toISOString(),
        endDate: new Date(editEndDate).toISOString(),
      });
      setSuccess("Subscription updated");
      cancelEdit();
      await fetchAll();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (row: PremiumRow) => {
    if (!row.isManual) {
      setError(
        "Stripe-managed subscriptions can't be revoked from here — use the Stripe dashboard.",
      );
      return;
    }
    if (
      !confirm(
        `Revoke premium for ${row.user?.username ?? row.subscription.userId}? They will return to the free tier immediately.`,
      )
    )
      return;

    setActionLoading(row.subscription.userId);
    setError("");
    setSuccess("");
    try {
      await revokePremium(row.subscription.userId);
      setSuccess("Subscription revoked");
      setRows((prev) =>
        prev.filter((r) => r.subscription.userId !== row.subscription.userId),
      );
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to revoke subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const goToEditPage = (row: PremiumRow) => {
    const role = row.user?.role;
    const id = row.subscription.userId;
    if (role === "player") navigate(`/admin/player/edit/${id}`);
    else if (role === "team") navigate(`/admin/team/edit/${id}`);
    else if (role === "scout") navigate(`/admin/scout/edit/${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Premium Users
          </h1>
          <p className="text-gray-600 mt-1">
            All players, teams, and scouts with active premium subscriptions.
            Edit plans or revoke manually-granted access.
          </p>
        </div>
        <Button onClick={fetchAll} variant="outline" disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
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
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex gap-2">
          {(["all", "player", "team", "scout"] as RoleFilter[]).map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(r)}
              className={
                roleFilter === r ? "bg-yellow-500 hover:bg-yellow-600" : ""
              }
            >
              {r === "all"
                ? "All Roles"
                : r.charAt(0).toUpperCase() + r.slice(1) + "s"}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, username, email, or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No premium users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                const isEditing = editingUserId === row.subscription.userId;
                const isBusy = actionLoading === row.subscription.userId;
                const expiringSoon =
                  new Date(row.subscription.endDate).getTime() - Date.now() <
                  7 * 24 * 60 * 60 * 1000;

                return (
                  <TableRow key={row.subscription.id}>
                    <TableCell>
                      <button
                        type="button"
                        className="text-left hover:underline"
                        onClick={() => goToEditPage(row)}
                      >
                        <div className="font-medium">
                          {row.user?.username ?? "(unknown)"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {row.user?.email}
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                        {row.user?.role ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <select
                          value={editPlanId}
                          onChange={(e) => setEditPlanId(e.target.value)}
                          className="p-1 border rounded text-sm dark:bg-gray-700 dark:text-white"
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (£{Number(p.price).toFixed(2)}/{p.interval})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          <div className="font-medium">
                            {row.subscription.plan?.name ?? row.subscription.planId}
                          </div>
                          <div className="text-xs text-gray-500">
                            £
                            {Number(row.subscription.plan?.price ?? 0).toFixed(2)}{" "}
                            / {row.subscription.plan?.interval}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                            className="p-1 border rounded text-sm dark:bg-gray-700 dark:text-white"
                          />
                          <input
                            type="date"
                            value={editEndDate}
                            min={editStartDate || todayInput()}
                            onChange={(e) => setEditEndDate(e.target.value)}
                            className="p-1 border rounded text-sm dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div>
                            {new Date(
                              row.subscription.startDate,
                            ).toLocaleDateString()}
                          </div>
                          <div
                            className={
                              expiringSoon
                                ? "text-orange-600 font-medium"
                                : "text-gray-600"
                            }
                          >
                            →{" "}
                            {new Date(
                              row.subscription.endDate,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.isManual ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Manual
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Stripe
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={isBusy}
                          >
                            <X className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveEdit(row.subscription.userId)}
                            disabled={isBusy}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            {isBusy ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Save className="w-4 h-4 mr-1" />
                            )}
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(row)}
                          >
                            <Pencil className="w-4 h-4 mr-1" /> Edit Plan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevoke(row)}
                            disabled={!row.isManual || isBusy}
                            className={
                              row.isManual
                                ? "border-red-500 text-red-600 hover:bg-red-50"
                                : ""
                            }
                            title={
                              row.isManual
                                ? "Revoke manual grant"
                                : "Stripe-managed — revoke from Stripe dashboard"
                            }
                          >
                            {isBusy ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <RevokeIcon className="w-4 h-4 mr-1" />
                            )}
                            Revoke
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {filtered.length} of {rows.length} premium user
        {rows.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default PremiumUsers;
