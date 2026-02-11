import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIOps Healing Platform",
  description: "Autonomous Incident Response & Healing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0f172a] text-slate-100 flex">
        {/* Sidebar */}
        <aside className="w-64 fixed h-full glass-panel border-r border-slate-800 z-50 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              AIOps Platform
            </h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <NavItem href="/" icon="📊" label="Dashboard" active />
            <NavItem href="/incidents" icon="🚨" label="Incidents" />
            <NavItem href="/health" icon="❤️" label="Service Health" />
            <NavItem href="/automation" icon="⚡" label="Automation" />
            <NavItem href="/settings" icon="⚙️" label="Settings" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
              <div>
                <p className="text-sm font-medium">DevOps Admin</p>
                <p className="text-xs text-slate-400">Online</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 relative overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <a 
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
          : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-100"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </a>
  );
}
