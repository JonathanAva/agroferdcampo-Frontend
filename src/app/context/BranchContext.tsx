import { createContext, useContext, useState, ReactNode } from 'react';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

const BRANCHES: Branch[] = [
  {
    id: '1',
    name: 'Sucursal Centro',
    address: 'Av. Principal #123, San Salvador',
    phone: '2222-1234'
  },
  {
    id: '2',
    name: 'Sucursal Sur',
    address: 'Blvd. Sur #456, San Salvador',
    phone: '2222-5678'
  }
];

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch>(BRANCHES[0]);

  return (
    <BranchContext.Provider value={{ 
      branches: BRANCHES, 
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
