import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { simulateMatch, getPlayers } from "../services/api";

function Simulation() {

  const [message, setMessage] = useState("");

  const [players, setPlayers] = useState([]);

  const [selectedGame, setSelectedGame] = useState("Minecraft");

  const [player1, setPlayer1] = useState("");

  const [player2, setPlayer2] = useState("");

  useEffect(() => {

    async function fetchPlayers() {

      try {

        const data = await getPlayers();

        setPlayers(data);

      } catch (error) {
        console.log(error);
      }

    }

    fetchPlayers();

  }, []);

  async function handleSimulation() {

    try {

      const result = await simulateMatch({
        player1,
        player2,
        game: selectedGame,
      });

      setMessage(result.message);

    } catch (error) {

      console.log(error);

    }

  }

  return (
    <MainLayout>

      <div className="px-16 pt-10 pb-20">

        <div className="mb-14">

          <p className="text-cyan-400 tracking-[10px] mb-4">
            SIMULASI MATCH
          </p>

          <h1 className="text-7xl font-black leading-tight">
            SIMULASI
            <br />
            PERTANDINGAN
          </h1>

        </div>

        <div className="grid grid-cols-2 gap-10">

          {/* LEFT */}
          <div
            className="
              bg-white/5
              backdrop-blur-xl
              border
              border-cyan-400/20
              p-10
              shadow-[0_0_50px_rgba(34,211,238,0.15)]
            "
            style={{
              clipPath:
                "polygon(0 0, 96% 0, 100% 10%, 100% 100%, 4% 100%, 0 90%)",
            }}
          >

            <h2 className="text-3xl font-black mb-10">
              MULAI SIMULASI
            </h2>

            <div className="space-y-6">

              {/* GAME */}
              <select
                value={selectedGame}
                onChange={(e) =>
                  setSelectedGame(e.target.value)
                }
                className="
                  w-full
                  p-4
                  bg-[#0f172a]
                  border
                  border-cyan-400/20
                  rounded-xl
                "
              >
                <option>Minecraft</option>
                <option>Othergame</option>
              </select>

              {/* PLAYER 1 */}
              <select
                value={player1}
                onChange={(e) =>
                  setPlayer1(e.target.value)
                }
                className="
                  w-full
                  p-4
                  bg-[#0f172a]
                  border
                  border-cyan-400/20
                  rounded-xl
                "
              >

                <option value="">
                  Pilih Pemain 1
                </option>

                {players.map((player) => (

                  <option
                    key={player.username}
                    value={player.username}
                  >
                    {player.username}
                  </option>

                ))}

              </select>

              {/* PLAYER 2 */}
              <select
                value={player2}
                onChange={(e) =>
                  setPlayer2(e.target.value)
                }
                className="
                  w-full
                  p-4
                  bg-[#0f172a]
                  border
                  border-cyan-400/20
                  rounded-xl
                "
              >

                <option value="">
                  Pilih Pemain 2
                </option>

                {players.map((player) => (

                  <option
                    key={player.username}
                    value={player.username}
                  >
                    {player.username}
                  </option>

                ))}

              </select>

              <button
                onClick={handleSimulation}
                className="
                  w-full
                  py-4
                  bg-cyan-400
                  text-black
                  font-bold
                  rounded-xl
                  hover:scale-[1.02]
                  transition
                  shadow-[0_0_30px_rgba(34,211,238,0.8)]
                "
              >
                JALANKAN SIMULASI
              </button>

            </div>

          </div>

          {/* RIGHT */}
          <div
            className="
              bg-white/5
              backdrop-blur-xl
              border
              border-cyan-400/20
              p-10
              shadow-[0_0_50px_rgba(34,211,238,0.15)]
            "
            style={{
              clipPath:
                "polygon(0 0, 96% 0, 100% 10%, 100% 100%, 4% 100%, 0 90%)",
            }}
          >

            <h2 className="text-3xl font-black mb-10">
              UPDATE TERKINI
            </h2>

            <div className="space-y-5">

              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                Leaderboard Redis tersinkron
              </div>

              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                ZombieRush siap dimainkan
              </div>

              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                Othergame menunggu konfigurasi
              </div>

              {message && (

                <div
                  className="
                    bg-cyan-400/10
                    border
                    border-cyan-400/20
                    p-5
                    rounded-xl
                    text-cyan-300
                  "
                >
                  {message}
                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Simulation;