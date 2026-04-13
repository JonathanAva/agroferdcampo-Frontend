import { Search, Moon, Sun, LogOut, MapPin, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { branches, selectedBranch, setSelectedBranch } = useBranch();
  const navigate = useNavigate();
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowBranchMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header 
      className="flex items-center justify-between px-8 py-4 border-b"
      style={{ 
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Search Bar */}
      <div 
        className="flex items-center gap-3 px-4 py-2 rounded-lg border w-80"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <Search size={18} style={{ color: 'var(--text-sec)' }} />
        <input
          type="text"
          placeholder="Buscar productos, clientes..."
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--text-main)' }}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Branch Selector */}
        {user?.role === 'admin' && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)'
              }}
            >
              <MapPin size={18} style={{ color: 'var(--accent)' }} />
              <span className="font-medium">{selectedBranch.name}</span>
              <ChevronDown size={16} />
            </button>

            {showBranchMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-lg border shadow-lg overflow-hidden z-50"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  boxShadow: '0 10px 25px var(--shadow)'
                }}
              >
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowBranchMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 transition-colors"
                    style={{ 
                      backgroundColor: selectedBranch.id === branch.id ? 'var(--bg)' : 'transparent',
                      color: 'var(--text-main)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedBranch.id !== branch.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-sm" style={{ color: 'var(--text-sec)' }}>
                      {branch.address}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all"
          style={{ 
            backgroundColor: 'var(--accent)',
            color: '#ffffff'
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
              {user?.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-sec)' }}>
              {user?.role === 'admin' ? 'Administrador' : 
               user?.role === 'supervisor' ? 'Supervisor' :
               user?.role === 'cashier' ? 'Cajero' : 'Bodeguero'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--bg)',
              color: 'var(--text-sec)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-sec)';
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
