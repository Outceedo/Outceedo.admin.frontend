import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Loader2, Calendar, Ban } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "day" | "week" | "month" | "year" | "one_time";
  description?: string | null;
}

interface CurrentSubscription {
  id: string;
  planId: string;
  status: "ACTIVE" | "CANCELED" | "EXPIRED" | "PENDING";
  stripeId: string;
  startDate: string;
  endDate: string;
  plan?: { name: string; price: number; interval: string };
}

interface Props {
  userId: string;
}

const apiBase = import.meta.env.VITE_PORT;

const headers = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Api-Key": token,
    "Content-Type": "application/json",
  };
};

const formatDateInputValue = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const PremiumGrant: React.FC<Props> = ({ userId }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [current, setCurrent] = useState<CurrentSubscription | null>(null);
  const [currentLoading, setCurrentLoading] = useState(false);

  const today = useMemo(() => formatDateInputValue(new Date()), []);
  const oneMonthLater = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return formatDateInputValue(d);
  }, []);

  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(oneMonthLater);

  const [submitting, setSubmitting] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const res = await axios.get(`${apiBase}/subscription/plans`, {
        headers: headers(),
      });
      setPlans(res.data?.plans ?? []);
    } catch (err: any) {
      console.error("Failed to load plans", err);
      setError(err.response?.data?.message || "Failed to load plans");
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchCurrent = async () => {
    try {
      setCurrentLoading(true);
      const res = await axios.get(
        `${apiBase}/subscription/user/${userId}`,
        { headers: headers() },
      );
      setCurrent(res.data?.subscription ?? null);
    } catch (err: any) {
      console.error("Failed to load current subscription", err);
    } finally {
      setCurrentLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (userId) fetchCurrent();
  }, [userId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!planId) {
      setError("Please select a plan");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both start and end date");
      return;
    }
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    if (startMs >= endMs) {
      setError("Start date must be before end date");
      return;
    }
    if (endMs <= Date.now()) {
      setError("End date must be in the future");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${apiBase}/subscription/grant-premium`,
        {
          userId,
          planId,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
        { headers: headers() },
      );
      setSuccess(res.data?.message || "Premium granted successfully");
      await fetchCurrent();
    } catch (err: any) {
      console.error("Grant premium failed", err);
      setError(err.response?.data?.message || "Failed to grant premium");
    } finally {
      setSubmitting(false);
    }
  };

  const isActive =
    current?.status === "ACTIVE" &&
    new Date(current.endDate).getTime() > Date.now();

  const isManual = current?.stripeId.startsWith("manual_") ?? false;

  const onRevoke = async () => {
    if (!current) return;
    if (!isManual) {
      setError(
        "Stripe-managed subscriptions can't be revoked here — use the Stripe dashboard.",
      );
      return;
    }
    if (
      !confirm(
        "Revoke this user's premium subscription and revert them to the free tier immediately?",
      )
    )
      return;

    setError("");
    setSuccess("");
    setRevoking(true);
    try {
      const res = await axios.post(
        `${apiBase}/subscription/revoke/${userId}`,
        {},
        { headers: headers() },
      );
      setSuccess(res.data?.message || "Subscription revoked");
      await fetchCurrent();
    } catch (err: any) {
      console.error("Revoke failed", err);
      setError(err.response?.data?.message || "Failed to revoke subscription");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-500" />
        Premium Subscription
      </h3>

      {/* Current status */}
      <div className="mb-4 rounded-md border bg-gray-50 dark:bg-gray-700 p-4">
        {currentLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading current
            subscription...
          </div>
        ) : current ? (
          <div className="text-sm space-y-1 text-gray-700 dark:text-gray-200">
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={
                  isActive
                    ? "text-green-600 dark:text-green-400 font-medium"
                    : "text-gray-500"
                }
              >
                {isActive ? "ACTIVE" : current.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Plan:</span>{" "}
              {current.plan?.name ?? current.planId}
            </div>
            <div>
              <span className="font-medium">Period:</span>{" "}
              {new Date(current.startDate).toLocaleDateString()} –{" "}
              {new Date(current.endDate).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {isManual
                ? "Manually granted by admin"
                : "Stripe-managed subscription"}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            No subscription on record — user is on the free tier.
          </div>
        )}
      </div>

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-400">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Plan
          </label>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            disabled={plansLoading || plans.length === 0}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white disabled:opacity-60"
          >
            <option value="">
              {plansLoading
                ? "Loading plans..."
                : plans.length === 0
                  ? "No plans available"
                  : "Select a plan"}
            </option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — £{Number(p.price).toFixed(2)} / {p.interval}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> End date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || today}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="md:col-span-4 flex justify-end gap-2">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Granting...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                {isActive ? "Replace with new grant" : "Grant Premium"}
              </>
            )}
          </Button>
          {isActive && (
            <Button
              type="button"
              onClick={onRevoke}
              disabled={revoking || !isManual}
              title={
                isManual
                  ? "Revoke premium and revert to free tier"
                  : "Stripe-managed — revoke from the Stripe dashboard"
              }
              className="bg-black hover:bg-gray-800 text-white disabled:opacity-50"
            >
              {revoking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reverting...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Revert to Free
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      <p className="text-xs text-gray-500 mt-3">
        Account auto-reverts to the free tier after the end date passes.
        Manually-granted subscriptions are flipped to EXPIRED by an hourly
        backend job.
      </p>
    </div>
  );
};

export default PremiumGrant;
