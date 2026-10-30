import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { economicActivities } from '../../types/catalogs';

const PAGE_SIZE = 10;

/** Quita tildes y pasa a minúsculas para comparar textos */
const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Hacienda solo acepta códigos de 5 dígitos; las secciones ("A", "01", ...) son solo agrupadores.
const ACTIVITIES = economicActivities
  .filter((a) => /^\d{5}$/.test(a.value))
  .map((a) => ({ ...a, search: normalize(`${a.value} ${a.label}`) }));

interface EconomicActivityPickerProps {
  value: string;
  onChange: (code: string, description: string) => void;
}

export function EconomicActivityPicker({ value, onChange }: EconomicActivityPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = ACTIVITIES.find((a) => a.value === value);

  const results = useMemo(() => {
    const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return ACTIVITIES;
    return ACTIVITIES.filter((a) => terms.every((t) => a.search.includes(t)));
  }, [query]);

  // Al cambiar la búsqueda, volver a la primera página
  useEffect(() => setVisible(PAGE_SIZE), [query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const select = (code: string, label: string) => {
    onChange(code, label);
    setOpen(false);
    setQuery('');
  };

  const shown = results.slice(0, visible);

  return (
    <div ref={containerRef} className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-card px-4 text-left text-sm shadow-sm"
      >
        <span className={cn('truncate', !selected && 'text-[var(--text-sec)]')}>
          {selected ? `${selected.value} - ${selected.label}` : 'Seleccione la actividad económica'}
        </span>
        <ChevronDown size={16} className="shrink-0 opacity-50" />
      </button>

      {open && (
        <div
          className="rounded-md border border-[var(--border)] bg-[var(--card)] p-2 shadow-lg"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
            }
          }}
        >
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // Enter selecciona el primer resultado en vez de enviar el formulario
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (shown[0]) select(shown[0].value, shown[0].label);
                }
              }}
              placeholder="Buscar por código o nombre (ej. 46632, ferretería)"
              className="pl-8 pr-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <ul className="mt-2 space-y-0.5">
            {shown.map((a) => (
              <li key={a.value}>
                <button
                  type="button"
                  onClick={() => select(a.value, a.label)}
                  className={cn(
                    'flex w-full items-start gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-[var(--primary)]/10',
                    a.value === value && 'text-[var(--primary)] font-semibold',
                  )}
                >
                  <span className="font-mono text-xs pt-0.5 opacity-70">{a.value}</span>
                  <span className="flex-1">{a.label}</span>
                  {a.value === value && <Check size={14} className="mt-0.5 shrink-0" />}
                </button>
              </li>
            ))}
            {shown.length === 0 && (
              <li className="px-2 py-3 text-center text-sm text-[var(--text-sec)]">
                No se encontraron actividades para "{query}"
              </li>
            )}
          </ul>

          {results.length > 0 && (
            <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-2 text-xs text-[var(--text-sec)]">
              <span>
                Mostrando {shown.length} de {results.length}
              </span>
              {visible < results.length && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="font-bold text-[var(--primary)] hover:underline"
                >
                  Ver 10 más
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
