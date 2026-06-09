import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  listMatches,
  updateMatch,
  settleMatch,
  getMatchPredictions,
  type Match,
  type MatchStatus,
  type MatchPredictionsSummary,
} from "@/services/matchesService";

const STATUS_STYLES: Record<MatchStatus, string> = {
  SCHEDULED: "bg-gray-200 text-gray-700",
  LIVE: "bg-red-100 text-red-700",
  FINISHED: "bg-green-100 text-green-700",
};

// Local editable copy of the fields an admin can change for a fixture.
type Draft = {
  home: string;
  homeCode: string;
  away: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
};

const draftFrom = (m: Match): Draft => ({
  home: m.home,
  homeCode: m.homeCode,
  away: m.away,
  awayCode: m.awayCode,
  homeScore: m.homeScore,
  awayScore: m.awayScore,
  status: m.status,
});

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const [predictions, setPredictions] =
    useState<MatchPredictionsSummary | null>(null);
  const [predictionsFor, setPredictionsFor] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMatches();
      setMatches(data);
      setDrafts(
        Object.fromEntries(data.map((m) => [m.matchId, draftFrom(m)])),
      );
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Failed to load matches. Have they been seeded?",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stages = useMemo(
    () => Array.from(new Set(matches.map((m) => m.stage))),
    [matches],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return matches.filter((m) => {
      if (stageFilter !== "ALL" && m.stage !== stageFilter) return false;
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      if (
        q &&
        !`${m.home} ${m.away} ${m.venue} ${m.city}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [matches, stageFilter, statusFilter, search]);

  const patchDraft = (matchId: number, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [matchId]: { ...d[matchId], ...patch } }));

  const isDirty = (m: Match) => {
    const d = drafts[m.matchId];
    if (!d) return false;
    return (
      d.home !== m.home ||
      d.homeCode !== m.homeCode ||
      d.away !== m.away ||
      d.awayCode !== m.awayCode ||
      d.homeScore !== m.homeScore ||
      d.awayScore !== m.awayScore ||
      d.status !== m.status
    );
  };

  const handleSave = async (m: Match) => {
    const d = drafts[m.matchId];
    setSavingId(m.matchId);
    setError(null);
    try {
      const updated = await updateMatch(m.matchId, {
        home: d.home,
        homeCode: d.homeCode,
        away: d.away,
        awayCode: d.awayCode,
        homeScore: d.homeScore,
        awayScore: d.awayScore,
        status: d.status,
      });
      setMatches((list) =>
        list.map((x) => (x.matchId === m.matchId ? updated : x)),
      );
      setDrafts((dd) => ({ ...dd, [m.matchId]: draftFrom(updated) }));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to save match.");
    } finally {
      setSavingId(null);
    }
  };

  const handleSettle = async (m: Match) => {
    const d = drafts[m.matchId];
    const ok = window.confirm(
      `Settle ${d.home} ${d.homeScore}–${d.awayScore} ${d.away}?\n\n` +
        `This finalises the result and awards 1 coin to every correct prediction. ` +
        `It can't be undone.`,
    );
    if (!ok) return;

    setBusyId(m.matchId);
    setError(null);
    try {
      const result = await settleMatch(m.matchId, {
        homeScore: d.homeScore,
        awayScore: d.awayScore,
      });
      window.alert(
        `Settled. Outcome: ${result.outcome}. ` +
          `${result.correct}/${result.settledPredictions} correct, ` +
          `${result.coinsAwarded} coins awarded.`,
      );
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to settle match.");
    } finally {
      setBusyId(null);
    }
  };

  const handleViewPredictions = async (matchId: number) => {
    if (predictionsFor === matchId) {
      setPredictionsFor(null);
      setPredictions(null);
      return;
    }
    setPredictionsFor(matchId);
    setPredictions(null);
    try {
      setPredictions(await getMatchPredictions(matchId));
    } catch {
      setPredictions(null);
    }
  };

  return (
    <div className="w-full max-w-full p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            WC2026 Matches
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update live scores and settle results to reward correct predictions.
          </p>
        </div>
        <Button onClick={load} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white"
        >
          <option value="ALL">All stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white"
        >
          <option value="ALL">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="LIVE">Live</option>
          <option value="FINISHED">Finished</option>
        </select>
        <Input
          placeholder="Search team / venue…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading matches…</div>
      ) : visible.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No matches found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((m) => {
            const d = drafts[m.matchId];
            if (!d) return null;
            const dirty = isDirty(m);
            return (
              <div
                key={m.matchId}
                className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      #{m.matchId}
                    </span>
                    <span>· {m.stage}</span>
                    {m.group && <span>· Group {m.group}</span>}
                    <span>
                      · {m.date} {m.time}
                    </span>
                    <span>· {m.venue}</span>
                  </div>
                  <Badge className={STATUS_STYLES[m.status]}>
                    {m.status}
                    {m.outcome ? ` · ${m.outcome}` : ""}
                  </Badge>
                </div>

                {/* Scoreline editor */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <input
                      value={d.home}
                      onChange={(e) =>
                        patchDraft(m.matchId, { home: e.target.value })
                      }
                      className="font-semibold text-right bg-transparent border-b border-transparent focus:border-gray-300 outline-none dark:text-white"
                    />
                    <input
                      value={d.homeCode}
                      onChange={(e) =>
                        patchDraft(m.matchId, { homeCode: e.target.value })
                      }
                      className="text-xs text-right text-gray-400 bg-transparent outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={d.homeScore}
                      onChange={(e) =>
                        patchDraft(m.matchId, {
                          homeScore: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-16 text-center"
                    />
                    <span className="text-gray-400">–</span>
                    <Input
                      type="number"
                      min={0}
                      value={d.awayScore}
                      onChange={(e) =>
                        patchDraft(m.matchId, {
                          awayScore: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-16 text-center"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <input
                      value={d.away}
                      onChange={(e) =>
                        patchDraft(m.matchId, { away: e.target.value })
                      }
                      className="font-semibold bg-transparent border-b border-transparent focus:border-gray-300 outline-none dark:text-white"
                    />
                    <input
                      value={d.awayCode}
                      onChange={(e) =>
                        patchDraft(m.matchId, { awayCode: e.target.value })
                      }
                      className="text-xs text-gray-400 bg-transparent outline-none w-full"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <select
                    value={d.status}
                    onChange={(e) =>
                      patchDraft(m.matchId, {
                        status: e.target.value as MatchStatus,
                      })
                    }
                    className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:text-white"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="LIVE">Live</option>
                    <option value="FINISHED">Finished</option>
                  </select>

                  <Button
                    onClick={() => handleSave(m)}
                    disabled={!dirty || savingId === m.matchId}
                    variant="outline"
                  >
                    {savingId === m.matchId ? "Saving…" : "Save"}
                  </Button>

                  <Button
                    onClick={() => handleSettle(m)}
                    disabled={busyId === m.matchId || m.status === "FINISHED"}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {busyId === m.matchId
                      ? "Settling…"
                      : m.status === "FINISHED"
                        ? "Settled"
                        : "Settle & reward"}
                  </Button>

                  <Button
                    onClick={() => handleViewPredictions(m.matchId)}
                    variant="ghost"
                  >
                    {predictionsFor === m.matchId
                      ? "Hide predictions"
                      : "Predictions"}
                  </Button>
                </div>

                {/* Predictions panel */}
                {predictionsFor === m.matchId && (
                  <div className="mt-3 rounded-lg bg-gray-50 dark:bg-slate-800 p-3 text-sm">
                    {!predictions ? (
                      <span className="text-gray-500">Loading…</span>
                    ) : (
                      <div>
                        <div className="flex gap-4 font-medium mb-2">
                          <span>Total: {predictions.total}</span>
                          <span>Home: {predictions.tally.HOME}</span>
                          <span>Draw: {predictions.tally.DRAW}</span>
                          <span>Away: {predictions.tally.AWAY}</span>
                        </div>
                        {predictions.predictions.length > 0 && (
                          <div className="max-h-40 overflow-y-auto divide-y divide-gray-200 dark:divide-slate-700">
                            {predictions.predictions.map((p) => (
                              <div
                                key={p.id}
                                className="flex justify-between py-1"
                              >
                                <span className="text-gray-600 dark:text-gray-300">
                                  {p.email}
                                </span>
                                <span className="flex items-center gap-2">
                                  <span>{p.predicted}</span>
                                  {p.settled && (
                                    <span
                                      className={
                                        p.correct
                                          ? "text-green-600"
                                          : "text-red-500"
                                      }
                                    >
                                      {p.correct ? "✓ +1" : "✗"}
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
