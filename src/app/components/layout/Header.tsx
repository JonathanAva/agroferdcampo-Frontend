import { Search, Moon, Sun, LogOut, MapPin, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useBranch } from "../../context/BranchContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, selectBranch } = useAuth();
  const { branches, selectedBranch, setSelectedBranch } = useBranch();
  const navigate = useNavigate();
  useEffect(() => {
    // Scroll lock logic or other future effects can go here
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className="flex items-center justify-between px-4 md:px-8 py-4 border-b sticky top-0 z-30"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg md:hidden hover:bg-[var(--bg)] transition-colors"
          style={{ color: "var(--text-main)" }}
        >
          <Menu size={24} />
        </button>

        {/* Search Bar - Hidden on mobile, visible on tablet+ */}
        <div
          className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg border w-48 md:w-80 transition-all"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <Search size={18} style={{ color: "var(--text-sec)" }} />
          <input
            type="text"
            placeholder="Buscar..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-main)" }}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Branch Display (Non-clickable) */}
        {selectedBranch && (
          <div
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text-main)",
            }}
          >
            <MapPin
              size={18}
              style={{ color: "var(--accent)" }}
              className="shrink-0"
            />
            <span className="font-medium text-sm hidden sm:block truncate max-w-[150px] md:max-w-none">
              {selectedBranch.name}
            </span>
          </div>
        )}

        {/* Theme Toggle - Simplified on mobile */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition-all shrink-0"
          style={{
            backgroundColor: "var(--accent)",
            color: "#ffffff",
          }}
          title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          <span className="hidden md:block">
            {theme === "light" ? "Modo Oscuro" : "Modo Claro"}
          </span>
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden sm:block">
            <p
              className="font-semibold text-xs md:text-sm truncate max-w-[80px] md:max-w-none"
              style={{ color: "var(--text-main)" }}
            >
              {user?.name}
            </p>
            <p
              className="text-[10px] md:text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--accent)" }}
            >
              {user?.role || "Empleado"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg transition-colors bg-[var(--bg)]"
            style={{
              color: "var(--text-sec)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-sec)";
            }}
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
