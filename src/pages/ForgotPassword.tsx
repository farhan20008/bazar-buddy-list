import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getText } from "@/utils/translations";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    resetPassword
  } = useAuth();
  const {
    language
  } = useLanguage();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await resetPassword(email);
      if (success) {
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex flex-col justify-center items-start p-8 md:p-12 lg:p-16 xl:p-24">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <User size={16} />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Bazar Buddy</h1>
            </div>
            
            {!isSubmitted ? <>
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-muted-foreground">
                  Enter your email and we'll send you a link to reset your password
                </p>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="m@example.com" required type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-500 text-gray-50">
                    {isSubmitting ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Reset Link
                      </> : "Send Reset Link"}
                  </Button>
                </form>
              </> : <div className="space-y-4">
                <h1 className="text-2xl font-bold">Check Your Email</h1>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                </p>
              </div>}
            
            <div className="mt-6">
              <Link to="/login" className="flex items-center text-sm text-primary hover:underline">
                <ArrowLeft size={16} className="mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:block bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/0"></div>
      </div>
    </div>;
};
export default ForgotPassword;