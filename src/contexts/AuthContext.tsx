
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage (in real app, this would validate token)
    const storedUser = localStorage.getItem("bazarUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // This is a mock login - in a real app this would call an API
      // Normally this would validate against your backend
      if (email && password) {
        const mockUser = {
          id: crypto.randomUUID(),
          email,
          name: email.split('@')[0]
        };
        
        setUser(mockUser);
        localStorage.setItem("bazarUser", JSON.stringify(mockUser));
        toast({
          title: "Login successful",
          description: "Welcome back to Bazar Buddy!",
        });
        return true;
      }
      throw new Error("Invalid credentials");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      // This is a mock registration - in a real app this would call an API
      if (name && email && password) {
        const mockUser = {
          id: crypto.randomUUID(),
          email,
          name
        };
        
        setUser(mockUser);
        localStorage.setItem("bazarUser", JSON.stringify(mockUser));
        toast({
          title: "Registration successful",
          description: "Welcome to Bazar Buddy!",
        });
        return true;
      }
      throw new Error("Please complete all fields");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bazarUser");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
