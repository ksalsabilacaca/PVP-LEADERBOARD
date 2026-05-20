import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getLeaderboard, getStats, getMinecraftLeaderboard, getRobloxLeaderboard } from "../services/api";

function Leaderboard() {

  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState("minecraft");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. Establish SSE Client Connection
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3000/api/scores/live");

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

  // 2. Fetch stats and leaderboard data on mount or when refreshTrigger/activeTab updates
  useEffect(() => {
    async function fetchData() {
      setPlayers([]); // Clear current players while fetching new data
      try {
        const statsData = await getStats();
        setStats(statsData);

        let data = [];
        if (activeTab === "minecraft") {
          data = await getMinecraftLeaderboard();
        } else if (activeTab === "roblox") {
          data = await getRobloxLeaderboard();
        }
        setPlayers(data || []);
      } catch (error) {
        console.error(error);
        setPlayers([]); // Ensure it's cleared if the fetch throws an error
      }
    }
    fetchData();
  }, [activeTab, refreshTrigger]);

  function loadLeaderboard(type) {
    setActiveTab(type);
  }

  return (
    <MainLayout>

      <div className="px-16 pt-10 pb-20">

        {/* HEADER */}
        <div className="mb-14">

          <p className="text-cyan-400 tracking-[10px] mb-4">
            SISTEM REDIS REALTIME
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

            <p className="text-yellow-400 text-lg mb-3">
              PEMAIN TERATAS
            </p>

            <h2 className="text-4xl font-black mb-2">
              {players[0]?.username || "No Players Yet"}
            </h2>

            <p className="text-gray-300">
              {players[0]?.trophy !== undefined ? `${players[0].trophy} Trophy` : "0 Trophy"}
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
              TOTAL PEMAIN
            </p>

            <h2 className="text-4xl font-black mb-2">
              {stats.totalPlayers}
            </h2>

            <p className="text-gray-300">
              Total Data Tersimpan
            </p>

          </div>

        </div>

        {/* FILTER BUTTONS */}
        <div className="flex gap-5 mb-10">

          {/* MINECRAFT */}
          <button
            onClick={() =>
              loadLeaderboard("minecraft")
            }
            className={`
                    px-6
                    py-3
                    rounded-xl
                    font-bold
                    transition

                    ${activeTab === "minecraft"
                ? "bg-green-400 text-black shadow-[0_0_25px_rgba(34,197,94,0.8)]"
                : "border border-green-400 hover:bg-green-400/10"
              }
                `}
          >
            MINECRAFT
          </button>

          {/* ROCK PAPER SCISSORS */}
          <button
            onClick={() =>
              loadLeaderboard("roblox")
            }
            className={`
                    px-6
                    py-3
                    rounded-xl
                    font-bold
                    transition

                    ${activeTab === "roblox"
                ? "bg-cyan-400 text-black shadow-[0_0_25px_rgba(34,211,238,0.8)]"
                : "border border-cyan-400 hover:bg-cyan-400/10"
              }
                `}
          >
            ROCK PAPER SCISSORS
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

          {/* PLAYERS */}
          {players.map((player) => (

            <div
              key={player.rank}
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
              <div className="font-bold text-cyan-400">
                #{player.rank}
              </div>

              {/* PLAYER */}
              <div className="font-semibold">
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

                        ${activeTab === "minecraft"
                      ? "bg-green-500/20 text-green-300"

                      : activeTab === "roblox"
                        ? "bg-cyan-500/20 text-cyan-300"

                        : player.game === "Minecraft"
                          ? "bg-green-500/20 text-green-300"

                          : "bg-cyan-500/20 text-cyan-300"
                    }
                     `}
                >
                  {activeTab === "minecraft" ? "Minecraft" : "Rock Paper Scissors"}
                </span>

              </div>

              {/* TROPHY */}
              <div className="font-bold">
                {player.trophy}
              </div>

            </div>

          ))}

        </div>

      </div>

    </MainLayout>
  );
}

export default Leaderboard;