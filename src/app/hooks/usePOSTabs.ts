import { useState, useEffect } from 'react';

export interface POSTabData {
  id: string;
  name: string;
  cart: any[];
  selectedPayment: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO' | 'MIXTO';
  selectedCustomer: any | null;
  payments: any[];
  transportData: any | null;
  checkoutDueDate: string;
  preSaleDescription: string;
}

const defaultTab = (id: string, name: string): POSTabData => ({
  id,
  name,
  cart: [],
  selectedPayment: 'EFECTIVO',
  selectedCustomer: null,
  payments: [],
  transportData: null,
  checkoutDueDate: '',
  preSaleDescription: ''
});

export function usePOSTabs() {
  const [tabs, setTabs] = useState<POSTabData[]>(() => {
    const saved = localStorage.getItem('pos_tabs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [defaultTab('tab-1', 'Venta 1')];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const saved = localStorage.getItem('pos_active_tab');
    if (saved && tabs.some(t => t.id === saved)) return saved;
    return tabs[0]?.id || 'tab-1';
  });

  useEffect(() => {
    localStorage.setItem('pos_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('pos_active_tab', activeTabId);
  }, [activeTabId]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateTab = (data: Partial<POSTabData>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...data } : t));
  };

  const addTab = () => {
    if (tabs.length >= 5) {
      alert("Máximo 5 pestañas permitidas.");
      return;
    }
    const newId = 'tab-' + Date.now();
    const newName = 'Venta ' + (tabs.length + 1);
    setTabs(prev => [...prev, defaultTab(newId, newName)]);
    setActiveTabId(newId);
  };

  const removeTab = (id: string) => {
    if (tabs.length === 1) {
      // Clear the single tab instead of removing
      setTabs([defaultTab(id, tabs[0].name)]);
      return;
    }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    activeTab,
    updateTab,
    addTab,
    removeTab
  };
}
