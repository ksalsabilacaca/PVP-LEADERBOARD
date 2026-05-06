import { Link } from "react-router-dom";

function MainLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-500 opacity-20 blur-[140px] rounded-full"></div>

      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-400 opacity-20 blur-[140px] rounded-full"></div>

      {/* NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-16 py-8">

        <Link
          to="/"
          className="text-2xl font-bold text-cyan-400 tracking-widest"
        >
          GROUP 3
        </Link>

        <div className="flex gap-12 text-lg">

          <Link
            to="/"
            className="hover:text-cyan-400 transition"
          >
            HOME
          </Link>

          <Link
            to="/leaderboard"
            className="hover:text-cyan-400 transition"
          >
            LEADERBOARD
          </Link>

          <Link
            to="/simulation"
            className="hover:text-cyan-400 transition"
          >
            SIMULATION
          </Link>

          <Link
            to="/profile"
            className="hover:text-cyan-400 transition"
          >
            PROFILE
          </Link>

        </div>

      </nav>

      {/* PAGE CONTENT */}
      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
}

export default MainLayout;