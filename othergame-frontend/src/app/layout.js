import "./globals.css";

export const metadata = {
  title: "RPS Arena | MinPro SBD 3",
  description: "Rock Paper Scissors leaderboard game for Mini Project SBD Kelompok 3.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-gray-100">{children}</body>
    </html>
  );
}
