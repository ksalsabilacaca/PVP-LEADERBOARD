import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const SERVER_ADDRESS = "minpro-sbd3.live";
const BEDROCK_PORT = "19132";
const RPS_PLAY_URL = import.meta.env.VITE_RPS_PLAY_URL || "http://localhost:3001";

async function copyText(text) {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return false;
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    return false;
  }
}

function PlayZombieRush() {
  const [copied, setCopied] = useState({ ip: false, port: false });

  async function handleCopy(text, key) {
    const success = await copyText(text);
    if (!success) return;

    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  }

  return (
    <MainLayout>
      <div className="px-16 pt-10 pb-16">
        <div className="mb-10">
          <p className="text-cyan-400 tracking-[8px] mb-3">
            SISTEM REDIS REALTIME • MODE: PLAY
          </p>

          <h1 className="text-7xl font-black leading-tight">PLAY ZOMBIE RUSH</h1>

          <p className="text-gray-300 text-xl leading-relaxed mt-4 max-w-[760px]">
            Mainkan mini game Zombie Rush melalui server Minecraft Kelompok 3.
          </p>

          <p className="text-gray-300 text-lg leading-relaxed mt-2 max-w-[760px]">
            Dapat dimainkan melalui Minecraft Java Edition dan Minecraft Bedrock Edition.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8 mb-8">
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
              clipPath: "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
            }}
          >
            <p className="text-cyan-400 text-lg font-bold mb-4">INFORMASI SERVER</p>

            <div className="space-y-6 text-gray-200">
              <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div>
                  <p className="text-sm text-cyan-300 mb-2">SERVER IP</p>
                  <p className="text-2xl md:text-3xl font-black text-cyan-200 break-words">
                    {SERVER_ADDRESS}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(SERVER_ADDRESS, "ip")}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    whitespace-nowrap
                    w-fit
                    min-w-[140px]
                    shrink-0
                    px-5
                    py-2.5
                    rounded-xl
                    font-bold
                    transition
                    border
                    border-cyan-400/40
                    text-cyan-200
                    hover:bg-cyan-400/10
                  "
                >
                  {copied.ip ? "IP DISALIN" : "SALIN IP"}
                </button>
              </div>

              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 mt-6">
                <div className="bg-white/5 border border-cyan-400/20 rounded-xl p-5 min-w-0">
                  <p className="text-sm text-cyan-300 mb-3">JAVA EDITION</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-cyan-300">Address</p>
                      <p className="text-base md:text-lg font-semibold text-white break-words">
                        {SERVER_ADDRESS}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-300">Port</p>
                      <p className="text-base md:text-lg font-semibold text-white">Default</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-cyan-400/20 rounded-xl p-5 min-w-0">
                  <p className="text-sm text-cyan-300 mb-3">BEDROCK EDITION</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-cyan-300">Address</p>
                      <p className="text-base md:text-lg font-semibold text-white break-words">
                        {SERVER_ADDRESS}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs text-cyan-300">Port Bedrock</p>
                        <p className="text-2xl md:text-3xl font-black tracking-widest text-white">
                          {BEDROCK_PORT}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(BEDROCK_PORT, "port")}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          whitespace-nowrap
                          w-fit
                          min-w-[150px]
                          shrink-0
                          px-5
                          py-2.5
                          rounded-xl
                          font-bold
                          transition
                          border
                          border-cyan-400/40
                          text-cyan-200
                          hover:bg-cyan-400/10
                        "
                      >
                        {copied.port ? "PORT DISALIN" : "SALIN PORT"}
                      </button>
                    </div>

                    <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                      Untuk Bedrock Edition, isi port tambahan {BEDROCK_PORT}.
                    </p>
                  </div>
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
              p-8
              shadow-[0_0_40px_rgba(34,211,238,0.15)]
            "
            style={{
              clipPath: "polygon(0 0, 92% 0, 100% 15%, 100% 100%, 8% 100%, 0 85%)",
            }}
          >
            <p className="text-cyan-400 text-lg font-bold mb-4">CARA BERMAIN</p>
            <div className="space-y-5 text-gray-200">
              {[
                "Buka Minecraft Java Edition atau Minecraft Bedrock Edition.",
                "Masuk ke menu Multiplayer / Server.",
                `Tambahkan server dengan IP ${SERVER_ADDRESS}.`,
                `Untuk Bedrock Edition, gunakan port ${BEDROCK_PORT}.`,
                "Setelah masuk ke server, player akan diarahkan ke Hub.",
                "Klik atau pukul NPC Zombie Rush di lobby untuk mulai bermain.",
                "Skor otomatis tersimpan dan tampil di leaderboard."
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-cyan-400/20 text-cyan-200 font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-base md:text-lg leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/leaderboard"
            className="
              px-8
              py-3
              bg-cyan-400
              text-black
              font-bold
              rounded-xl
              hover:scale-105
              transition
              shadow-[0_0_30px_rgba(34,211,238,0.6)]
            "
          >
            LIHAT LEADERBOARD
          </Link>

          <a
            href={RPS_PLAY_URL}
            className="
              px-8
              py-3
              border
              border-cyan-400/40
              text-cyan-200
              font-bold
              rounded-xl
              hover:bg-cyan-400/10
              transition
            "
          >
            MAIN ROCK PAPER SCISSORS
          </a>

          <Link
            to="/"
            className="
              px-8
              py-3
              border
              border-white/20
              text-gray-200
              font-bold
              rounded-xl
              hover:bg-white/10
              transition
            "
          >
            KEMBALI KE BERANDA
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}

export default PlayZombieRush;
