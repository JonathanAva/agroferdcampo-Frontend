import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Package, Users, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { apiRequest } from '../../config/api';
import { cn } from '../ui/utils';

interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  type: 'customer' | 'product' | 'sale';
  icon: React.ReactNode;
  url: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const searchTasks = [];
      const q = encodeURIComponent(debouncedQuery);
      
      // 1. Customers
      searchTasks.push(
        apiRequest<any[]>(`/customers/search?q=${q}`)
          .then(data => {
            const items = Array.isArray(data) ? data : (data as any).data || [];
            return items.slice(0, 5).map((c: any) => ({
              id: c.id,
              title: c.name,
              subtitle: c.nit || c.documentNumber || 'Cliente',
              type: 'customer',
              icon: <Users size={14} className="text-blue-500" />,
              url: `/customers?search=${encodeURIComponent(c.name)}`
            }));
          })
          .catch(() => [])
      );

      // 2. Products
      searchTasks.push(
        apiRequest<any[]>(`/catalog/products/search?q=${q}`)
          .then(data => {
            const items = Array.isArray(data) ? data : (data as any).data || [];
            return items.slice(0, 5).map((p: any) => ({
              id: p.id,
              title: p.name,
              subtitle: p.internalCode || 'Producto',
              type: 'product',
              icon: <Package size={14} className="text-emerald-500" />,
              url: `/catalog?search=${encodeURIComponent(p.name)}`
            }));
          })
          .catch(() => [])
      );

      // 3. Sales
      searchTasks.push(
        apiRequest<any>(`/sales?search=${q}&limit=5`)
          .then(res => {
            const items = Array.isArray(res) ? res : res?.data || [];
            return items.map((s: any) => ({
              id: s.id,
              title: `Venta #${s.id}`,
              subtitle: `$${Number(s.totalAmount).toFixed(2)} - ${s.customer?.name || 'Varios'}`,
              type: 'sale',
              icon: <FileText size={14} className="text-amber-500" />,
              url: `/sales`
            }));
          })
          .catch(() => [])
      );

      try {
        const [customers, products, sales] = await Promise.all(searchTasks);
        setResults([...customers, ...products, ...sales]);
      } catch (error) {
        console.error("Global search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    navigate(result.url);
  };

  return (
    <div ref={wrapperRef} className="relative hidden sm:block w-48 md:w-80">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg border transition-all",
          isOpen ? "ring-2 ring-[var(--primary)]/20" : ""
        )}
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <Search size={18} style={{ color: "var(--text-sec)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Búsqueda global..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--text-main)" }}
        />
        {loading && <Loader2 size={14} className="animate-spin text-[var(--primary)]" />}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim().length >= 2 && (
        <div 
          className="absolute top-full mt-2 w-full max-w-[400px] left-0 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[70vh]"
        >
          {loading && results.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-[var(--text-sec)]">
              <Loader2 size={24} className="animate-spin mb-2 text-[var(--primary)]" />
              <p className="text-xs font-bold">Buscando...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="overflow-y-auto p-2 flex flex-col gap-1">
              {results.map((r, i) => (
                <button
                  key={`${r.type}-${r.id}-${i}`}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg)] transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-md bg-[var(--bg)] border border-[var(--border)] group-hover:bg-[var(--card)] transition-colors">
                      {r.icon}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-[var(--text-main)] truncate">{r.title}</span>
                      <span className="text-xs text-[var(--text-sec)] truncate">{r.subtitle}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-sec)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--text-sec)]">
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold">No se encontraron resultados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
