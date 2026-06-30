import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Clock, ChevronDown } from 'lucide-react';
import { apiRequest } from '../../config/api';
import { cn } from './utils';

interface SavedAddress {
  id: number;
  address: string;
  usedCount: number;
}

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  rows?: number;
}

export function AddressInput({
  value,
  onChange,
  placeholder = 'Ingrese la dirección...',
  className,
  disabled,
  id,
  rows = 2,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<SavedAddress[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<SavedAddress[]>(`/saved-addresses?q=${encodeURIComponent(q)}&limit=8`);
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 280);
  };

  const handleFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) setOpen(true);
    else if (value.length < 2) {
      // Show recents on empty focus
      apiRequest<SavedAddress[]>('/saved-addresses?limit=6').then(data => {
        if (data.length > 0) { setSuggestions(data); setOpen(true); }
      }).catch(() => {});
    }
  };

  const handleSelect = (addr: string) => {
    onChange(addr);
    setOpen(false);
  };

  const saveAddress = useCallback(async (addr: string) => {
    if (addr.trim().length < 5) return;
    try {
      await apiRequest('/saved-addresses', { method: 'POST', body: JSON.stringify({ address: addr.trim() }) });
    } catch { /* silent */ }
  }, []);

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 150);
    if (value.trim().length >= 5) saveAddress(value);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin
          size={14}
          className="absolute left-2.5 top-2.5 text-[var(--text-sec)] pointer-events-none z-10"
        />
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            'w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-[var(--border)]',
            'bg-[var(--bg)] text-[var(--text-main)] placeholder:text-[var(--text-sec)]',
            'resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)]',
            'transition-colors',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
        />
        {loading && (
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-2.5 text-[var(--text-sec)] animate-bounce"
          />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-[var(--text-sec)] tracking-wider border-b border-[var(--border)] flex items-center gap-1.5">
            <Clock size={10} />
            Direcciones guardadas
          </div>
          <ul>
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(s.address)}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] flex items-start gap-2 transition-colors"
                >
                  <MapPin size={13} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                  <span className="truncate">{s.address}</span>
                  {s.usedCount > 1 && (
                    <span className="ml-auto shrink-0 text-[10px] text-[var(--text-sec)]">
                      ×{s.usedCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
