import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import { getPlayerProfile,} from "../services/api";

function Profile() {

  const [player, setPlayer] =
    useState(null);

  useEffect(() => {

    async function fetchPlayer() {

      try {

        const data =
          await getPlayerProfile(
            "DragonX"
          );

        setPlayer(data);

      } catch (error) {

        console.log(error);

      }

    }

    fetchPlayer();

  }, []);

  if (!player) {
    return null;
  }

  return (
    <MainLayout>

      <div className="px-16 pt-10 pb-20">

        <div className="mb-14">

          <p className="text-cyan-400 tracking-[10px] mb-4">
            PLAYER ANALYTICS
          </p>

          <h1 className="text-7xl font-black leading-tight">
            PLAYER
            <br />
            PROFILE
          </h1>

        </div>

        <div className="grid grid-cols-3 gap-10">

          {/* LEFT CARD */}
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

            <div className="flex justify-center mb-10">

              <div
                className="
                  w-40
                  h-40
                  bg-gradient-to-br
                  from-cyan-400
                  to-blue-700
                  flex
                  items-center
                  justify-center
                  text-6xl
                  shadow-[0_0_40px_rgba(34,211,238,0.5)]
                "
                style={{
                  clipPath:
                    "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)",
                }}
              >
                🎮
              </div>

            </div>

            <h2 className="text-4xl font-black text-center mb-3">
              {player.username}
            </h2>

            <p className="text-center text-cyan-400 mb-10">
              {player.game} Player
            </p>

            <div className="space-y-5">

              <div className="flex justify-between">
                <span>Global Rank</span>
                <span>#{player.rank}</span>
              </div>

              <div className="flex justify-between">
                <span>Trophy</span>
                <span>{player.trophy}</span>
              </div>

              <div className="flex justify-between">
                <span>Wins</span>
                <span>{player.wins}</span>
              </div>

              <div className="flex justify-between">
                <span>Losses</span>
                <span>{player.losses}</span>
              </div>

              <div className="flex justify-between">
                <span>Country</span>
                <span>{player.country}</span>
              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div
            className="
              col-span-2
              bg-white/5
              backdrop-blur-xl
              border
              border-cyan-400/20
              p-10
              shadow-[0_0_50px_rgba(34,211,238,0.15)]
            "
            style={{
              clipPath:
                "polygon(0 0, 98% 0, 100% 5%, 100% 100%, 2% 100%, 0 95%)",
            }}
          >

            <h2 className="text-4xl font-black mb-10">
              MATCH HISTORY
            </h2>

            <div className="space-y-5">

              {player.history.map((item, index) => (

                <div
                  key={index}
                  className="
                    bg-black/20
                    p-5
                    rounded-xl
                    border
                    border-white/5
                    hover:bg-cyan-400/5
                    transition
                  "
                >
                  {item}
                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Profile;