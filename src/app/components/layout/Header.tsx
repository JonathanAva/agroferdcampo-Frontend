import { Search, Moon, Sun, LogOut, MapPin, Menu } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { useBranch } from "../../context/BranchContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { NotificationsBell } from "./NotificationsBell";
import { GlobalSearch } from "./GlobalSearch";

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
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu size={24} />
        </Button>

        <GlobalSearch />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        <NotificationsBell />

        {/* Branch Display (Non-clickable) */}
        {(selectedBranch || user?.branch) && (
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
              style={{ color: "var(--primary)" }}
              className="shrink-0"
            />
            <span className="font-medium text-sm hidden sm:block truncate max-w-[150px] md:max-w-none">
              {selectedBranch?.name || user?.branch}
            </span>
          </div>
        )}

        {/* Minimalist Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center w-16 h-8 rounded-full transition-colors focus:outline-none shrink-0"
          style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
          title={theme === "light" ? "Activar Modo Oscuro" : "Activar Modo Claro"}
        >
          {/* Iconos de fondo */}
          <div className="absolute w-full flex justify-between px-2">
            <Sun size={14} style={{ color: 'var(--text-sec)' }} />
            <Moon size={14} style={{ color: 'var(--text-sec)' }} />
          </div>
          
          {/* Círculo deslizante */}
          <div
            className={`absolute left-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out ${
              theme === "dark" ? "translate-x-8" : "translate-x-0 bg-white"
            }`}
            style={{ 
              backgroundColor: theme === "dark" ? "var(--text-main)" : "white",
              color: theme === "dark" ? "var(--bg)" : "var(--text-main)"
            }}
          >
            {theme === "dark" ? (
              <Moon size={12} className="stroke-[3px]" />
            ) : (
              <Sun size={12} className="text-amber-500 stroke-[3px]" />
            )}
          </div>
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
              style={{ color: "var(--color-primary)" }}
            >
              {user?.role || "Empleado"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-[var(--color-primary)] bg-[var(--bg)]"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
