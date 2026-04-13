import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'cashier' | 'warehouse';
  branch: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users para demo
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    name: 'Carlos Yanez',
    email: 'admin@agroferdcampo.com',
    password: 'admin123',
    role: 'admin',
    branch: 'Todas'
  },
  {
    id: '2',
    name: 'María González',
    email: 'supervisor@agroferdcampo.com',
    password: 'super123',
    role: 'supervisor',
    branch: 'Sucursal 1'
  },
  {
    id: '3',
    name: 'Juan Pérez',
    email: 'cajero@agroferdcampo.com',
    password: 'cajero123',
    role: 'cashier',
    branch: 'Sucursal 1'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('agro-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('agro-user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agro-user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
