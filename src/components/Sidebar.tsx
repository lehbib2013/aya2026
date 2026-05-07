"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/",             label: "Tableau de bord", icon: "🏠" },
  { href: "/marrees",      label: "Marées",          icon: "⚓" },
  { href: "/bateaux",      label: "Bateaux",          icon: "🚢" },
  { href: "/depenses",     label: "Dépenses",         icon: "💸" },
  { href: "/journal",      label: "Journal de Pêche", icon: "📋" },
  { href: "/recettes",     label: "Recettes",         icon: "💰" },
  { href: "/caisse",       label: "Caisse",           icon: "🏧" },
  { href: "/fournisseurs", label: "Fournisseurs",     icon: "🏭" },
  { href: "/capitaines",   label: "Capitaines",       icon: "👨‍✈️" },
  { href: "/bilan",        label: "Bilan",            icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col h-screen bg-[#1e293b] transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } shrink-0`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              A
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">AYA PÊCHE</p>
              <p className="text-slate-400 text-xs">Gestion Maritime</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto">
            A
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition-colors ml-auto"
          title={collapsed ? "Étendre" : "Réduire"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""} ${
                collapsed ? "justify-center px-2" : ""
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-slate-500 text-xs text-center">v1.0.0 — AYA PÊCHE</p>
        </div>
      )}
    </aside>
  );
}
