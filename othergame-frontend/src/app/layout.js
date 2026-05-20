import "./globals.css";

export const metadata = {
  title: "RPS Arena - Rock Paper Scissors",
  description: "A premium best-of-3 Rock-Paper-Scissors game against AI with real-time global leaderboard integration.",
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
