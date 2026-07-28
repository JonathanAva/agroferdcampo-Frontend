import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Filter, X, Calendar as CalendarIcon, Check, PlusCircle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Calendar } from './calendar';
import { Switch } from './switch';
import { Label } from './label';
import { cn } from './utils';

// --- Types ---

export type FilterType = 'text' | 'number_range' | 'date_range' | 'category' | 'boolean' | 'multi_category';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[]; // Required for 'category'
  placeholder?: string;
  icon?: React.ReactNode;
}

interface SmartFilterProps {
  config: FilterConfig[];
  className?: string;
}

// --- Debounce Hook ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Component ---
export function SmartFilter({ config, className }: SmartFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for the main search input to allow debouncing
  const mainSearchConfig = config.find(c => c.type === 'text');
  const [localSearch, setLocalSearch] = useState('');
  
  // Initialize local search from URL
  useEffect(() => {
    if (mainSearchConfig) {
      setLocalSearch(searchParams.get(mainSearchConfig.id) || '');
    }
  }, [searchParams, mainSearchConfig?.id]);

  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync debounced search to URL
  useEffect(() => {
    if (mainSearchConfig) {
      const currentVal = searchParams.get(mainSearchConfig.id) || '';
      if (debouncedSearch !== currentVal) {
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          if (debouncedSearch) {
            newParams.set(mainSearchConfig.id, debouncedSearch);
          } else {
            newParams.delete(mainSearchConfig.id);
          }
          // Reset pagination to page 1 when searching
          if (newParams.has('page')) newParams.set('page', '1');
          return newParams;
        }, { replace: true });
      }
    }
  }, [debouncedSearch, mainSearchConfig, setSearchParams, searchParams]);

  const setFilter = useCallback((id: string, value: string | null) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(id, value);
      } else {
        newParams.delete(id);
      }
      // Reset pagination when filter changes
      if (newParams.has('page')) newParams.set('page', '1');
      return newParams;
    });
  }, [setSearchParams]);

  const clearAllFilters = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      config.forEach(c => newParams.delete(c.id));
      if (newParams.has('page')) newParams.set('page', '1');
      return newParams;
    });
  };

  const removeFilter = (id: string) => {
    setFilter(id, null);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    config.forEach(c => {
      if (searchParams.has(c.id)) count++;
    });
    return count;
  }, [searchParams, config]);

  const nonTextConfigs = config.filter(c => c.type !== 'text');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {mainSearchConfig && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={mainSearchConfig.placeholder || `Buscar por ${mainSearchConfig.label.toLowerCase()}...`}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {nonTextConfigs.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {nonTextConfigs.map(c => {
              const currentVal = searchParams.get(c.id);
              
              if (c.type === 'category') {
                return (
                  <Popover key={c.id}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="border-dashed h-10">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {c.label}
                        {currentVal && (
                          <>
                            <div className="mx-2 h-4 w-[1px] bg-border" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                              {c.options?.find(o => o.value === currentVal)?.label || currentVal}
                            </Badge>
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" style={{ width: 'max-content', minWidth: '120px', maxWidth: '350px' }} align="start">
                      <div className="p-2 space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-between font-normal h-8 px-2 gap-4"
                          onClick={() => setFilter(c.id, null)}
                        >
                          <span className="truncate text-left">Todos</span>
                          {!currentVal ? <Check className="h-4 w-4 shrink-0" /> : <div className="w-4 h-4 shrink-0" />}
                        </Button>
                        {c.options?.map(opt => (
                          <Button
                            key={opt.value}
                            variant="ghost"
                            className="w-full justify-between font-normal h-8 px-2 gap-4"
                            onClick={() => setFilter(c.id, opt.value)}
                            title={opt.label}
                          >
                            <span className="truncate text-left">{opt.label}</span>
                            {currentVal === opt.value ? <Check className="h-4 w-4 shrink-0" /> : <div className="w-4 h-4 shrink-0" />}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              if (c.type === 'date_range') {
                const dateValue = currentVal ? parseISO(currentVal) : undefined;
                const isValidDate = dateValue && isValid(dateValue);

                return (
                  <div key={c.id} className="flex items-center">
                     <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="border-dashed h-10">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {c.label}
                          {currentVal && (
                            <>
                              <div className="mx-2 h-4 w-[1px] bg-border" />
                              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {isValidDate ? format(dateValue, 'dd/MM/yyyy') : currentVal}
                              </Badge>
                            </>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={isValidDate ? dateValue : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setFilter(c.id, format(date, 'yyyy-MM-dd'));
                            } else {
                              setFilter(c.id, null);
                            }
                          }}
                          initialFocus
                          locale={es}
                        />
                        <div className="flex items-center justify-between p-3 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-muted-foreground hover:text-foreground text-xs h-7"
                            onClick={() => setFilter(c.id, null)}
                          >
                            Borrar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10 text-xs h-7"
                            onClick={() => setFilter(c.id, format(new Date(), 'yyyy-MM-dd'))}
                          >
                            Hoy
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              }

              if (c.type === 'boolean') {
                return (
                  <div key={c.id} className="flex items-center gap-2 px-3 py-2 border rounded-md h-10 border-dashed">
                    <Label htmlFor={`filter-${c.id}`} className="text-sm cursor-pointer whitespace-nowrap">
                      {c.label}
                    </Label>
                    <Switch 
                      id={`filter-${c.id}`}
                      checked={currentVal === 'true'}
                      onCheckedChange={(checked) => setFilter(c.id, checked ? 'true' : null)}
                    />
                  </div>
                );
              }

              if (c.type === 'multi_category') {
                const currentVals = currentVal ? currentVal.split(',') : [];
                const handleToggle = (val: string) => {
                  const newVals = currentVals.includes(val)
                    ? currentVals.filter(v => v !== val)
                    : [...currentVals, val];
                  setFilter(c.id, newVals.length > 0 ? newVals.join(',') : null);
                };

                return (
                  <Popover key={c.id}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="border-dashed h-10">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {c.label}
                        {currentVals.length > 0 && (
                          <>
                            <div className="mx-2 h-4 w-[1px] bg-border" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                              {currentVals.length} sel.
                            </Badge>
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" style={{ width: 'max-content', minWidth: '150px', maxWidth: '350px' }} align="start">
                      <div className="p-2 space-y-1">
                        {c.options?.map(opt => (
                          <Button
                            key={opt.value}
                            variant="ghost"
                            className="w-full justify-start font-normal h-8 px-2 gap-3"
                            onClick={() => handleToggle(opt.value)}
                            title={opt.label}
                          >
                            <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", currentVals.includes(opt.value) ? "bg-primary border-primary text-primary-foreground" : "border-input")}>
                              {currentVals.includes(opt.value) && <Check className="h-3 w-3" />}
                            </div>
                            <span className="truncate text-left">{opt.label}</span>
                          </Button>
                        ))}
                        {currentVals.length > 0 && (
                          <div className="pt-2 mt-2 border-t">
                            <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground" onClick={() => setFilter(c.id, null)}>
                              Limpiar
                            </Button>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              if (c.type === 'number_range') {
                const parts = currentVal ? currentVal.split('-') : [];
                const min = parts[0] || '';
                const max = parts[1] || '';

                const updateRange = (newMin: string, newMax: string) => {
                  if (!newMin && !newMax) {
                    setFilter(c.id, null);
                  } else {
                    setFilter(c.id, `${newMin}-${newMax}`);
                  }
                };

                return (
                  <Popover key={c.id}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="border-dashed h-10">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {c.label}
                        {(min || max) && (
                          <>
                            <div className="mx-2 h-4 w-[1px] bg-border" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                              {min && max ? `${min} - ${max}` : min ? `>= ${min}` : `<= ${max}`}
                            </Badge>
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Rango de Precio</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              placeholder="Mín" 
                              value={min} 
                              onChange={(e) => updateRange(e.target.value, max)} 
                              className="h-8"
                            />
                            <span>-</span>
                            <Input 
                              type="number" 
                              placeholder="Máx" 
                              value={max} 
                              onChange={(e) => updateRange(min, e.target.value)} 
                              className="h-8"
                            />
                          </div>
                        </div>
                        {(min || max) && (
                          <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground" onClick={() => setFilter(c.id, null)}>
                            Limpiar
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              return null;
            })}

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="h-10 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
              >
                Limpiar filtros
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Active filters display (optional, since badges are now inline in the buttons) */}
      {/* Keeping it simple and clean. The Shadcn pattern usually puts active filters inside the trigger button as badges. */}
    </div>
  );
}
