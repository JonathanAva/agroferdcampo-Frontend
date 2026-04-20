import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth, Branch } from './AuthContext';

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { availableBranches, user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (availableBranches.length > 0) {
      // Intentar encontrar la sucursal actual basada en el nombre guardado en user
      const current = availableBranches.find(b => b.name === user?.branch) || availableBranches[0];
      
      // Actualizar solo si es diferente para evitar ciclos
      if (current && (!selectedBranch || current.id !== selectedBranch.id)) {
        setSelectedBranch(current);
      }
    }
  }, [availableBranches, user?.branch, selectedBranch]);

  return (
    <BranchContext.Provider value={{ 
      branches: availableBranches, 
      selectedBranch, 
      setSelectedBranch 
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
}
