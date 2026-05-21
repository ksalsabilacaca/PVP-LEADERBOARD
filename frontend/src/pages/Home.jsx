import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function Home() {
  return (
    <MainLayout>

      <div className="flex items-center justify-between px-20 pt-10">

        {/* LEFT SIDE */}
        <div className="relative">

          <div className="w-[420px] h-[420px] bg-gradient-to-br from-cyan-400 to-blue-700 opacity-20 blur-3xl absolute"></div>

          <div
            className="
              relative
              w-[350px]
              h-[350px]
              bg-gradient-to-br
              from-blue-400
              to-cyan-700
              border
              border-cyan-300
              shadow-[0_0_50px_rgba(56,189,248,0.7)]
            "
            style={{
              clipPath:
                "polygon(10% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)",
            }}
          >

            <div className="flex items-center justify-center h-full text-8xl">
              🎮
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="max-w-[600px]">

          <p className="text-cyan-400 tracking-[10px] mb-4">
            SISTEM REDIS REALTIME
          </p>

          <h1 className="text-7xl font-black leading-tight mb-6">
            LEADERBOARD
            <br />
            ZOMBIE RUSH
            <br />
            MINI PROJECT SBD
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed mb-10">
            Unified competitive ranking platform with realtime score updates
            powered by Redis Key-Value Store and PostgreSQL (Neon).
          </p>

          <div className="flex gap-6">

            <Link
              to="/leaderboard"
              className="
                px-8
                py-4
                bg-cyan-400
                text-black
                font-bold
                rounded-xl
                hover:scale-105
                transition
                shadow-[0_0_30px_rgba(34,211,238,0.8)]
              "
            >
              MASUK LEADERBOARD
            </Link>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Home;