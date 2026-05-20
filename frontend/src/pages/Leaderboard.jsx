import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getLeaderboard, getStats, getRobloxLeaderboard } from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getModeLabel(activeTab) {
  if (activeTab === "minecraft-best") return "ZOMBIERUSH • BEST SCORE";
  if (activeTab === "minecraft-total") return "ZOMBIERUSH • TOTAL SCORE";
  if (activeTab === "roblox") return "ROCK PAPER SCISSORS";
  return "SEMUA GAME";
}

function getGameLabel(activeTab, player) {
  if (activeTab === "minecraft-best" || activeTab === "minecraft-total") {
    return "ZombieRush";
  }

  if (activeTab === "roblox") {
    return "Rock Paper Scissors";
  }

  return player.game || "Game";
}

function getPlayerName(player, index) {
  const uuid = player.uuid || "";
  const rawName = player.username || player.playerName || player.name || "";

  if (rawName && rawName !== uuid) {
    return rawName;
  }

  if (uuid) {
    return `Player ${uuid.slice(-8)}`;
  }

  return `Player ${index + 1}`;
}

function normalizePlayers(data, activeTab) {
  const list = Array.isArray(data) ? data : data?.value || [];

  return list.map((player, index) => ({
    rank: player.rank ?? index + 1,
    uuid: player.uuid || player.id || "",
    username: getPlayerName(player, index),
    trophy: Number(player.trophy ?? player.score ?? 0),
    game: getGameLabel(activeTab, player),
  }));
}

async function getZombieRushLeaderboard(type) {
  const response = await fetch(`${API_BASE_URL}/api/zombierush/leaderboard/${type}`);

  if (!response.ok) {
    throw new Error(`Gagal mengambil leaderboard ZombieRush ${type}.`);
  }

  return response.json();
}

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState("minecraft-best");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const modeLabel = getModeLabel(activeTab);

  // Koneksi SSE realtime dari backend teman.
  // Jika ada update score, frontend akan refresh data.
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/scores/live`);

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
      setPlayers([]);

      try {
        const statsData = await getStats().catch(() => ({}));
        setStats(statsData || {});

        let data = [];

        if (activeTab === "all") {
          data = await getLeaderboard();
        } else if (activeTab === "minecraft-best") {
          data = await getZombieRushLeaderboard("best");
        } else if (activeTab === "minecraft-total") {
          data = await getZombieRushLeaderboard("total");
        } else if (activeTab === "roblox") {
          data = await getRobloxLeaderboard();
        }

        setPlayers(normalizePlayers(data, activeTab));
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
            LEADERBOARD
            <br />
            ZOMBIERUSH
          </h1>
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
            <p className="text-yellow-400 text-lg mb-3">PEMAIN TERATAS</p>

            <h2 className="text-4xl font-black mb-2 break-words">
              {players[0]?.username || "No Players Yet"}
            </h2>

            <p className="text-gray-300">
              {players[0]?.trophy !== undefined
                ? `${players[0].trophy} Score`
                : "0 Score"}
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
            <p className="text-green-400 text-lg mb-3">TOTAL PEMAIN</p>

            <h2 className="text-4xl font-black mb-2">
              {stats.totalPlayers ?? players.length ?? 0}
            </h2>

            <p className="text-gray-300">Total Data Tersimpan</p>
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap gap-5 mb-10">
          <button onClick={() => loadLeaderboard("all")} className={tabClass("all")}>
            RINGKAS
          </button>

          <button
            onClick={() => loadLeaderboard("minecraft-best")}
            className={tabClass("minecraft-best", "green")}
          >
            BEST SCORE
          </button>

          <button
            onClick={() => loadLeaderboard("minecraft-total")}
            className={tabClass("minecraft-total", "yellow")}
          >
            TOTAL SCORE
          </button>

          <button onClick={() => loadLeaderboard("roblox")} className={tabClass("roblox")}>
            ROCK PAPER SCISSORS
          </button>

          <button
            onClick={refreshLeaderboard}
            className="
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

        {/* LEADERBOARD TABLE */}
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
            clipPath:
              "polygon(0 0, 98% 0, 100% 5%, 100% 100%, 2% 100%, 0 95%)",
          }}
        >
          {/* HEADER */}
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
            <div className="p-8 text-center text-red-300 font-semibold">
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && players.length === 0 && (
            <div className="p-8 text-center text-gray-300 font-semibold">
              Belum ada data leaderboard.
            </div>
          )}

          {!loading &&
            !errorMessage &&
            players.map((player) => (
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
                {/* RANK */}
                <div className="font-bold text-cyan-400">#{player.rank}</div>

                {/* PLAYER */}
                <div className="font-semibold break-words" title={player.uuid}>
                  {player.username}
                </div>

                {/* GAME */}
                <div>
                  <span
                    className={`
                      px-4
                      py-1
                      rounded-full
                      text-sm
                      font-semibold
                      ${
                        player.game === "ZombieRush"
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

                {/* SCORE */}
                <div className="font-bold">{player.trophy}</div>
              </div>
            ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default Leaderboard;