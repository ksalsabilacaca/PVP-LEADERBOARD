import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getLeaderboard, getStats, getMinecraftLeaderboard, getRobloxLeaderboard } from "../services/api";

function Leaderboard() {

  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState("best");

  useEffect(() => {
    async function fetchData() {

        try {

            const statsData =
                await getStats();

            setStats(statsData);

            loadLeaderboard("best");

            } catch (error) {

            console.log(error);

            }

    }

    fetchData();

    }, []);
    
    async function loadLeaderboard(type) {
        try {
            let data = [];
        if (type === "best") {
                data = await getMinecraftLeaderboard();
        } else if (type === "total") {
                data = await getRobloxLeaderboard();
            } else {
                data = await getLeaderboard();
            }

            setPlayers(data);
            setActiveTab(type);

        } catch (error) {
            console.log(error);
        }
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
        <div className="grid grid-cols-3 gap-8 mb-14">

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
              {stats.topPlayer}
            </h2>

            <p className="text-gray-300">
              {stats.topTrophy} Skor
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

            <p className="text-cyan-400 text-lg mb-3">
              MATCH AKTIF
            </p>

            <h2 className="text-4xl font-black mb-2">
              {stats.liveMatches}
            </h2>

            <p className="text-gray-300">
              Sedang Berjalan
            </p>

          </div>

          {/* CARD 3 */}
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

            {/* ALL */}
            <button
              onClick={() =>
              loadLeaderboard("all")
              }
                    className={`
                    px-6
                    py-3    
                    rounded-xl
                    font-bold
                    transition

                    ${
                        activeTab === "all"
                            ? "bg-cyan-400 text-black shadow-[0_0_25px_rgba(34,211,238,0.8)]"
                            : "border border-cyan-400 hover:bg-cyan-400/10"
                    }
                `}
            >
                    SEMUA
            </button>

            {/* MINECRAFT */}
            <button
              onClick={() =>
                loadLeaderboard("best")
              }
                className={`
                    px-6
                    py-3
                    rounded-xl
                    font-bold
                    transition

                    ${
                  activeTab === "best"
                            ? "bg-green-400 text-black shadow-[0_0_25px_rgba(34,197,94,0.8)]"
                            : "border border-green-400 hover:bg-green-400/10"
                    }
                `}
            >
              BEST
            </button>

            {/* ROBLOX */}
            <button
              onClick={() =>
                loadLeaderboard("total")
              }
                className={`
                    px-6
                    py-3
                    rounded-xl
                    font-bold
                    transition

                    ${
                  activeTab === "total"
                            ? "bg-cyan-400 text-black shadow-[0_0_25px_rgba(34,211,238,0.8)]"
                            : "border border-cyan-400 hover:bg-cyan-400/10"
                    }
                `}
            >
              TOTAL
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

            <div>PERINGKAT</div>
            <div>PEMAIN</div>
            <div>MODE</div>
            <div>SKOR</div>

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

                        ${
                        activeTab === "best"
                          ? "bg-green-500/20 text-green-300"

                          : activeTab === "total"
                          ? "bg-cyan-500/20 text-cyan-300"

                          : "bg-cyan-500/20 text-cyan-300"
                        }
                     `}
                    >

                    {
                        activeTab === "best"
                          ? "Best Score"

                          : activeTab === "total"
                          ? "Total Score"

                          : player.game
                    }
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