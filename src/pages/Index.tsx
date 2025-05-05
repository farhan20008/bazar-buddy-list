import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
const Index = () => {
  const {
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  return <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Welcome to Bazar Buddy
          </h1>
          <p className="text-muted-foreground">
            Your personal grocery management companion. Create and manage your monthly
            grocery lists with ease.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => navigate("/login")} className="bg-orange-600 hover:bg-orange-500 text-gray-50">
            Login
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
            Register
          </Button>
        </div>
      </div>
    </div>;
};
export default Index;