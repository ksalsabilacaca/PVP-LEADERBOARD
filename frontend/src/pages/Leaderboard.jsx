import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getRobloxLeaderboard } from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const EMPTY_TIMING = { fetchMs: 0, processMs: 0, totalMs: 0 };
const EMPTY_BACKEND_METRICS = { queryMs: null, processMs: null, totalMs: null, source: "" };

function resolvePlayerName(player, index) {
  const uuid = player.uuid || player.id || "";
  const rawName = player.playerName || player.username || player.name || player.value || "";

  if (rawName && rawName !== uuid) {
    return rawName;
  }

  if (uuid) {
    return `Player ${uuid.slice(-8)}`;
  }

  return `Player ${index + 1}`;
}

function normalizeZombieRush(data) {
  const list = Array.isArray(data) ? data : [];

  return list.map((player, index) => ({
    rank: player.rank ?? index + 1,
    uuid: player.uuid || "",
    username: resolvePlayerName(player, index),
    score: Number(player.score ?? 0),
    game: "Zombie Rush",
  }));
}

function normalizeRps(data) {
  const list = Array.isArray(data) ? data : [];

  return list.map((player, index) => ({
    rank: player.rank ?? index + 1,
    uuid: player.uuid || "",
    username: resolvePlayerName(player, index),
    score: Number(player.score ?? player.trophy ?? 0),
    game: "Rock Paper Scissors",
  }));
}

function buildTiming(fetchStart, fetchEnd, processEnd) {
  const fetchMs = fetchEnd - fetchStart;
  const processMs = processEnd - fetchEnd;
  const totalMs = processEnd - fetchStart;

  return { fetchMs, processMs, totalMs };
}

function formatMs(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Belum tersedia";
  }
  return `${value.toFixed(2)} ms`;
}

function unwrapResponse(response) {
  if (Array.isArray(response)) {
    return { data: response, metrics: null };
  }
  return {
    data: Array.isArray(response?.data) ? response.data : [],
    metrics: response?.metrics || null
  };
}

async function getZombieRushLeaderboard(type, limit = 1000) {
  const params = new URLSearchParams();

  if (limit) {
    params.set("limit", String(limit));
  }

  const query = params.toString();
  const url = `${API_BASE_URL}/zombierush/leaderboard/${type}${query ? `?${query}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gagal mengambil leaderboard Zombie Rush ${type}.`);
  }

  return response.json();
}

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [zombieRushPlayers, setZombieRushPlayers] = useState([]);
  const [rpsPlayers, setRpsPlayers] = useState([]);
  const [timings, setTimings] = useState({ zombierush: EMPTY_TIMING, rps: EMPTY_TIMING });
  const [backendMetrics, setBackendMetrics] = useState({
    zombierush: EMPTY_BACKEND_METRICS,
    rps: EMPTY_BACKEND_METRICS
  });
  const [activeTab, setActiveTab] = useState("zombierush");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const modeLabel =
    activeTab === "zombierush"
      ? "BEST ZOMBIE RUSH"
      : activeTab === "rps"
      ? "BEST ROCK PAPER SCISSORS"
      : "ALL GAME";

  const headerTitle =
    activeTab === "zombierush"
      ? ["LEADERBOARD", "ZOMBIE RUSH"]
      : activeTab === "rps"
      ? ["LEADERBOARD", "ROCK PAPER SCISSORS"]
      : ["LEADERBOARD", "ALL GAME"];

  const headerSubtitle =
    activeTab === "zombierush"
      ? "Peringkat berdasarkan skor tertinggi pemain Zombie Rush."
      : activeTab === "rps"
      ? "Peringkat berdasarkan total skor terbanyak pemain Rock Paper Scissors."
      : "Perbandingan leaderboard dan waktu proses data dari Zombie Rush dan Rock Paper Scissors.";

  // Koneksi SSE realtime dari backend teman.
  // Jika ada update score, frontend akan refresh data.
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/scores/live`);

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "update") {
          console.log("Realtime score update received. Triggering refresh...");
          setRefreshTrigger((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErrorMessage("");

      try {
        if (activeTab === "all") {
          const [zombieRushResult, rpsResult] = await Promise.all([
            fetchZombieRushBest(),
            fetchRpsBest(),
          ]);

          setZombieRushPlayers(zombieRushResult.data);
          setRpsPlayers(rpsResult.data);
          setPlayers([]);
        } else if (activeTab === "zombierush") {
          const zombieRushResult = await fetchZombieRushBest();
          setZombieRushPlayers(zombieRushResult.data);
          setPlayers(zombieRushResult.data);
        } else if (activeTab === "rps") {
          const rpsResult = await fetchRpsBest();
          setRpsPlayers(rpsResult.data);
          setPlayers(rpsResult.data);
        }
      } catch (error) {
        console.error(error);
        setPlayers([]);
        setErrorMessage(
          "Gagal mengambil data leaderboard. Pastikan backend local berjalan dan koneksi Redis/tunnel masih aktif."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab, refreshTrigger]);

  function loadLeaderboard(type) {
    setActiveTab(type);
  }

  function refreshLeaderboard() {
    setRefreshTrigger((prev) => prev + 1);
  }

  async function fetchZombieRushBest() {
    const fetchStart = performance.now();
    const response = await getZombieRushLeaderboard("best", 1000);
    const fetchEnd = performance.now();
    const { data, metrics } = unwrapResponse(response);
    const normalized = normalizeZombieRush(data);
    const processEnd = performance.now();
    const timing = buildTiming(fetchStart, fetchEnd, processEnd);

    setTimings((prev) => ({ ...prev, zombierush: timing }));
    setBackendMetrics((prev) => ({
      ...prev,
      zombierush: metrics || EMPTY_BACKEND_METRICS
    }));

    return { data: normalized, timing };
  }

  async function fetchRpsBest() {
    const fetchStart = performance.now();
    const response = await getRobloxLeaderboard();
    const fetchEnd = performance.now();
    const { data, metrics } = unwrapResponse(response);
    const normalized = normalizeRps(data);
    const processEnd = performance.now();
    const timing = buildTiming(fetchStart, fetchEnd, processEnd);

    setTimings((prev) => ({ ...prev, rps: timing }));
    setBackendMetrics((prev) => ({
      ...prev,
      rps: metrics || EMPTY_BACKEND_METRICS
    }));

    return { data: normalized, timing };
  }

  const topZombieRush = zombieRushPlayers[0];
  const topRps = rpsPlayers[0];
  const currentTop = activeTab === "zombierush" ? topZombieRush : topRps;
  const totalPlayers =
    activeTab === "zombierush"
      ? zombieRushPlayers.length
      : activeTab === "rps"
      ? rpsPlayers.length
      : zombieRushPlayers.length + rpsPlayers.length;
  const currentTiming = activeTab === "rps" ? timings.rps : timings.zombierush;
  const zombierushFrontendTotal = Number(timings.zombierush.totalMs);
  const rpsFrontendTotal = Number(timings.rps.totalMs);
  const zombierushBackendTotal = Number(backendMetrics.zombierush?.totalMs);
  const rpsBackendTotal = Number(backendMetrics.rps?.totalMs);
  const zombierushTotalMs = zombierushFrontendTotal + zombierushBackendTotal;
  const rpsTotalMs = rpsFrontendTotal + rpsBackendTotal;
  const hasTotalTimes =
    Number.isFinite(zombierushFrontendTotal) &&
    Number.isFinite(rpsFrontendTotal) &&
    Number.isFinite(zombierushBackendTotal) &&
    Number.isFinite(rpsBackendTotal) &&
    (zombierushTotalMs > 0 || rpsTotalMs > 0);
  const totalDiff = Math.abs(zombierushTotalMs - rpsTotalMs);
  const totalDiffText = hasTotalTimes ? formatMs(totalDiff) : "-";
  const diffIsTie = hasTotalTimes && totalDiff < 0.01;
  const diffWinner = !hasTotalTimes || diffIsTie
    ? null
    : zombierushTotalMs < rpsTotalMs
    ? { label: "Redis Win", className: "text-emerald-400" }
    : { label: "MongoDB Win", className: "text-amber-400" };
  const currentBackend = activeTab === "rps" ? backendMetrics.rps : backendMetrics.zombierush;

  function tabClass(tabName, color = "cyan") {
    const active = activeTab === tabName;

    const activeClass =
      color === "green"
        ? "bg-green-400 text-black shadow-[0_0_25px_rgba(34,197,94,0.8)]"
        : color === "yellow"
        ? "bg-yellow-400 text-black shadow-[0_0_25px_rgba(250,204,21,0.8)]"
        : "bg-cyan-400 text-black shadow-[0_0_25px_rgba(34,211,238,0.8)]";

    const inactiveClass =
      color === "green"
        ? "border border-green-400 hover:bg-green-400/10"
        : color === "yellow"
        ? "border border-yellow-400 hover:bg-yellow-400/10"
        : "border border-cyan-400 hover:bg-cyan-400/10";

    return `
      px-6
      py-3
      rounded-xl
      font-bold
      transition
      ${active ? activeClass : inactiveClass}
    `;
  }

  return (
    <MainLayout>
      <div className="px-16 pt-10 pb-20">
        {/* HEADER */}
        <div className="mb-14">
          <p className="text-cyan-400 tracking-[10px] mb-4">
            SISTEM REDIS REALTIME • MODE: {modeLabel}
          </p>

          <h1 className="text-7xl font-black leading-tight">
            {headerTitle[0]}
            <br />
            {headerTitle[1]}
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed mt-6 max-w-[720px]">
            {headerSubtitle}
          </p>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-2 gap-8 mb-14">
          {/* CARD 1 */}
          <div
            className="
              relative
              overflow-hidden
              bg-white/5
              backdrop-blur-xl
              border
              border-cyan-400/20
              p-8
              shadow-[0_0_40px_rgba(34,211,238,0.15)]
            "
            style={{
              clipPath:
                "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
            }}
          >
            <p className="text-yellow-400 text-lg mb-3">
              {activeTab === "all" ? "TOP ZOMBIE RUSH" : "PEMAIN TERATAS"}
            </p>

            <h2 className="text-4xl font-black mb-2 break-words">
              {activeTab === "all"
                ? topZombieRush?.username || "Belum ada data"
                : currentTop?.username || "Belum ada data"}
            </h2>

            <p className="text-gray-300">
              {activeTab === "all"
                ? `${topZombieRush?.score ?? 0} Skor`
                : `${currentTop?.score ?? 0} Skor`}
            </p>
          </div>

          {/* CARD 2 */}
          <div
            className="
              relative
              overflow-hidden
              bg-white/5
              backdrop-blur-xl
              border
              border-cyan-400/20
              p-8
              shadow-[0_0_40px_rgba(34,211,238,0.15)]
            "
            style={{
              clipPath:
                "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
            }}
          >
            <p className="text-green-400 text-lg mb-3">
              {activeTab === "all" ? "TOP ROCK PAPER SCISSORS" : "TOTAL PEMAIN"}
            </p>

            <h2 className="text-4xl font-black mb-2 break-words">
              {activeTab === "all"
                ? topRps?.username || "Belum ada data"
                : totalPlayers}
            </h2>

            <p className="text-gray-300">
              {activeTab === "all"
                ? `${topRps?.score ?? 0} Skor`
                : "Total Data Tersimpan"}
            </p>
          </div>
        </div>

        {activeTab !== "all" && (
          <div className="mb-10">
            <p className="text-cyan-400 tracking-[6px] mb-4">FRONTEND METRICS</p>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div
                className="
                  relative
                  overflow-hidden
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-cyan-400/20
                  p-6
                  shadow-[0_0_40px_rgba(34,211,238,0.15)]
                "
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
                }}
              >
                <p className="text-cyan-400 text-sm mb-2">FRONTEND FETCH</p>
                <p className="text-2xl font-black">{formatMs(currentTiming.fetchMs)}</p>
              </div>

              <div
                className="
                  relative
                  overflow-hidden
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-cyan-400/20
                  p-6
                  shadow-[0_0_40px_rgba(34,211,238,0.15)]
                "
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
                }}
              >
                <p className="text-cyan-400 text-sm mb-2">FRONTEND PROCESS</p>
                <p className="text-2xl font-black">{formatMs(currentTiming.processMs)}</p>
              </div>

              <div
                className="
                  relative
                  overflow-hidden
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-cyan-400/20
                  p-6
                  shadow-[0_0_40px_rgba(34,211,238,0.15)]
                "
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
                }}
              >
                <p className="text-cyan-400 text-sm mb-2">FRONTEND TOTAL</p>
                <p className="text-2xl font-black">{formatMs(currentTiming.totalMs)}</p>
              </div>
            </div>

            <p className="text-cyan-400 tracking-[6px] mb-4">BACKEND METRICS</p>
            <div className="grid grid-cols-4 gap-6">
              <div
                className="
                  relative
                  overflow-hidden
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-cyan-400/20
                  p-6
                  shadow-[0_0_40px_rgba(34,211,238,0.15)]
                "
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
                }}
              >
                <p className="text-cyan-400 text-sm mb-2">BACKEND QUERY</p>
                <p className="text-2xl font-black">{formatMs(currentBackend?.queryMs)}</p>
              </div>

              <div
                className="
                  relative
                  overflow-hidden
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-cyan-400/20
                  p-6
                  shadow-[0_0_40px_rgba(34,211,238,0.15)]
                "
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
                }}
              >
                <p className="text-cyan-400 text-sm mb-2">BACKEND PROCESS</p>
                <p className="text-2xl font-black">{formatMs(currentBackend?.processMs)}</p>
              </div>

              <div
                className="
                  relative
                  overflow-hidden
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-cyan-400/20
                  p-6
                  shadow-[0_0_40px_rgba(34,211,238,0.15)]
                "
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
                }}
              >
                <p className="text-cyan-400 text-sm mb-2">BACKEND TOTAL</p>
                <p className="text-2xl font-black">{formatMs(currentBackend?.totalMs)}</p>
              </div>

              <div
                className="
                  relative
                  overflow-hidden
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-cyan-400/20
                  p-6
                  shadow-[0_0_40px_rgba(34,211,238,0.15)]
                "
                style={{
                  clipPath:
                    "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
                }}
              >
                <p className="text-cyan-400 text-sm mb-2">SOURCE</p>
                <p className="text-lg font-black">
                  {currentBackend?.source || "Belum tersedia"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap gap-5 mb-10">
          <button
            onClick={() => loadLeaderboard("zombierush")}
            className={tabClass("zombierush", "green")}
          >
            BEST ZOMBIE RUSH
          </button>

          <button
            onClick={() => loadLeaderboard("rps")}
            className={tabClass("rps", "cyan")}
          >
            BEST ROCK PAPER SCISSORS
          </button>

          <button onClick={() => loadLeaderboard("all")} className={tabClass("all", "yellow")}>
            ALL GAME
          </button>

        </div>

        {activeTab === "all" ? (
          <>
            <div
              className="
                relative
                overflow-hidden
                bg-white/5
                backdrop-blur-xl
                border
                border-cyan-400/20
                p-8
                shadow-[0_0_50px_rgba(34,211,238,0.15)]
                mb-10
              "
              style={{
                clipPath:
                  "polygon(0 0, 98% 0, 100% 5%, 100% 100%, 2% 100%, 0 95%)",
              }}
            >
              <p className="text-cyan-400 text-lg font-bold mb-4 text-center w-full">
                PERBANDINGAN WAKTU PROSES
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div
                  className="
                    relative
                    overflow-hidden
                    bg-white/5
                    backdrop-blur-xl
                    border
                    border-green-400/20
                    p-6
                    shadow-[0_0_40px_rgba(34,197,94,0.15)]
                  "
                  style={{
                    clipPath:
                      "polygon(0 0, 96% 0, 100% 8%, 100% 100%, 4% 100%, 0 92%)",
                  }}
                >
                  <p className="text-green-300 font-semibold text-center">Zombie Rush</p>
                  <p className="text-xs text-green-200/80 text-center mt-1 mb-4">
                    Source: {backendMetrics.zombierush?.source || "Belum tersedia"}
                  </p>
                  <div className="space-y-4 text-gray-200">
                    <div>
                      <p className="text-xs uppercase text-green-200">Frontend Metrics</p>
                      <div className="mt-2 pl-4 space-y-1 text-sm text-gray-300">
                        <div>Frontend Fetch: {formatMs(timings.zombierush.fetchMs)}</div>
                        <div>Frontend Process: {formatMs(timings.zombierush.processMs)}</div>
                        <div>Frontend Total: {formatMs(timings.zombierush.totalMs)}</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-green-200">Backend Metrics</p>
                      <div className="mt-2 pl-4 space-y-1 text-sm text-gray-300">
                        <div>Backend Query: {formatMs(backendMetrics.zombierush?.queryMs)}</div>
                        <div>Backend Process: {formatMs(backendMetrics.zombierush?.processMs)}</div>
                        <div>Backend Total: {formatMs(backendMetrics.zombierush?.totalMs)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="
                    relative
                    overflow-hidden
                    bg-white/5
                    backdrop-blur-xl
                    border
                    border-cyan-400/20
                    p-6
                    shadow-[0_0_40px_rgba(34,211,238,0.15)]
                  "
                  style={{
                    clipPath:
                      "polygon(0 0, 96% 0, 100% 8%, 100% 100%, 4% 100%, 0 92%)",
                  }}
                >
                  <p className="text-cyan-300 font-semibold text-center">Rock Paper Scissors</p>
                  <p className="text-xs text-cyan-200/80 text-center mt-1 mb-4">
                    Source: {backendMetrics.rps?.source || "Belum tersedia"}
                  </p>
                  <div className="space-y-4 text-gray-200">
                    <div>
                      <p className="text-xs uppercase text-cyan-200">Frontend Metrics</p>
                      <div className="mt-2 pl-4 space-y-1 text-sm text-gray-300">
                        <div>Frontend Fetch: {formatMs(timings.rps.fetchMs)}</div>
                        <div>Frontend Process: {formatMs(timings.rps.processMs)}</div>
                        <div>Frontend Total: {formatMs(timings.rps.totalMs)}</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-cyan-200">Backend Metrics</p>
                      <div className="mt-2 pl-4 space-y-1 text-sm text-gray-300">
                        <div>Backend Query: {formatMs(backendMetrics.rps?.queryMs)}</div>
                        <div>Backend Process: {formatMs(backendMetrics.rps?.processMs)}</div>
                        <div>Backend Total: {formatMs(backendMetrics.rps?.totalMs)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-yellow-300 font-semibold">
                Selisih total waktu: {totalDiffText}
                {diffWinner && (
                  <span className={`ml-2 font-bold ${diffWinner.className}`}>
                    ({diffWinner.label})
                  </span>
                )}
              </p>
              <button
                onClick={refreshLeaderboard}
                className="
                  mt-6
                  px-6
                  py-3
                  rounded-xl
                  font-bold
                  transition
                  border
                  border-white/20
                  hover:bg-white/10
                "
              >
                REFRESH DATA
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {renderTable(
                "BEST ZOMBIE RUSH",
                "Peringkat berdasarkan skor tertinggi pemain Zombie Rush.",
                zombieRushPlayers,
                loading,
                errorMessage
              )}
              {renderTable(
                "BEST ROCK PAPER SCISSORS",
                "Peringkat berdasarkan total skor terbanyak pemain Rock Paper Scissors.",
                rpsPlayers,
                loading,
                errorMessage
              )}
            </div>
          </>
        ) : (
          renderTable(
            activeTab === "zombierush" ? "BEST ZOMBIE RUSH" : "BEST ROCK PAPER SCISSORS",
            activeTab === "zombierush"
              ? "Peringkat berdasarkan skor tertinggi pemain Zombie Rush."
              : "Peringkat berdasarkan total skor terbanyak pemain Rock Paper Scissors.",
            players,
            loading,
            errorMessage
          )
        )}
      </div>
    </MainLayout>
  );
}

function renderTable(title, subtitle, data, loading, errorMessage) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-cyan-400 tracking-[6px] mb-2">{title}</p>
        <p className="text-gray-300">{subtitle}</p>
      </div>

      <div
        className="
          bg-white/5
          backdrop-blur-xl
          border
          border-cyan-400/20
          overflow-hidden
          shadow-[0_0_50px_rgba(34,211,238,0.15)]
        "
        style={{
          clipPath: "polygon(0 0, 98% 0, 100% 5%, 100% 100%, 2% 100%, 0 95%)",
        }}
      >
        <div
          className="
            grid
            grid-cols-4
            bg-cyan-400/10
            border-b
            border-cyan-400/20
            p-5
            text-cyan-400
            font-bold
          "
        >
          <div>RANK</div>
          <div>PLAYER</div>
          <div>GAME</div>
          <div>SCORE</div>
        </div>

        {loading && (
          <div className="p-8 text-center text-cyan-300 font-semibold">
            Memuat data leaderboard...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="p-8 text-center text-red-300 font-semibold">{errorMessage}</div>
        )}

        {!loading && !errorMessage && data.length === 0 && (
          <div className="p-8 text-center text-gray-300 font-semibold">
            Belum ada data leaderboard.
          </div>
        )}

        {!loading &&
          !errorMessage &&
          data.map((player) => (
            <div
              key={`${player.game}-${player.rank}-${player.uuid || player.username}`}
              className="
                grid
                grid-cols-4
                p-5
                border-b
                border-white/5
                hover:bg-cyan-400/5
                transition
              "
            >
              <div className="font-bold text-cyan-400">#{player.rank}</div>

              <div className="font-semibold break-words" title={player.uuid}>
                {player.username}
              </div>

              <div>
                <span
                  className={`
                    px-4
                    py-1
                    rounded-full
                    text-sm
                    font-semibold
                    ${
                      player.game === "Zombie Rush"
                        ? "bg-green-500/20 text-green-300"
                        : player.game === "Rock Paper Scissors"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }
                  `}
                >
                  {player.game}
                </span>
              </div>

              <div className="font-bold">{player.score}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Leaderboard;