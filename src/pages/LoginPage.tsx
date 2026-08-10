//reference login page
import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, signup, isLoggedIn } = useAuth();

  const from = (location.state as any)?.from || "/profile";

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isLoggedIn) navigate(from, { replace: true });
  }, [isLoggedIn]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      } else {
        await signup({
          email: formData.email,
          password: formData.password,
          first_name: formData.fullName,
        });
        await login(formData.email, formData.password);
        toast.success("Account created! Welcome to Yuva Computers.");
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg =
        err?.email?.[0] ||
        err?.password?.[0] ||
        err?.detail ||
        "Invalid credentials. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth — requires @react-oauth/google
  // If not installed: npm install @react-oauth/google
  const handleGoogleLogin = async () => {
    toast.info("Google login — wire up after confirming OAuth setup");
    // Once @react-oauth/google is confirmed installed, replace with:
    // const { useGoogleLogin } = await import('@react-oauth/google');
    // This is handled below as a separate component if needed
  };

  return (
    <>
    <SEO title="Account Sign In | Yuva Computers" noindex={true} />
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-ambient p-8 md:p-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Yuva Computers"
            className="h-16 w-16 mx-auto rounded-xl object-contain border border-border shadow-sm"
          />
          <h2 className="text-2xl font-display font-bold text-foreground">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to your Yuva Computers account"
              : "Join us for the best refurbished tech deals"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Full Name
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="e.g. Ravi Kumar"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
                className="w-full border border-border rounded-xl px-4 py-3 pr-10 text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat your password"
                  className="w-full border border-border rounded-xl px-4 py-3 pr-10 text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-primary text-primary-foreground rounded-xl py-3 font-display font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-card text-[10px] text-muted-foreground uppercase tracking-widest">
              or continue with
            </span>
          </div>
        </div>

        {/* Google Button */}
        <GoogleLoginButton
          onSuccess={async (code: string) => {
            setIsLoading(true);
            try {
              await googleLogin(code);
              toast.success("Signed in with Google!");
              navigate(from, { replace: true });
            } catch {
              toast.error("Google sign-in failed. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }}
        />

        {/* Toggle */}
        <p className="text-center text-xs text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-primary hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
    </>
  );
}

// ── Google Button as separate component ──────────────────────────────────────
// This is isolated so the rest of the page works even if OAuth isn't wired yet

function GoogleLoginButton({ onSuccess }: { onSuccess: (code: string) => void }) {
  const googleLogin = useGoogleLogin({
    onSuccess: (res: any) => {
      if (res?.code) {
        onSuccess(res.code);
      } else {
        toast.error("Google login failed: No code received");
      }
    },
    onError: () => toast.error("Google login failed"),
    flow: "auth-code",
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 text-sm font-medium text-foreground hover:bg-muted transition"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}


function GoogleButtonInner({
  onSuccess,
  useGoogleLogin,
}: {
  onSuccess: (code: string) => void;
  useGoogleLogin: any;
}) {
  const googleLogin = useGoogleLogin({
    onSuccess: (res: any) => onSuccess(res.code),
    onError: () => toast.error("Google login failed"),
    flow: "auth-code",
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 text-sm font-medium text-foreground hover:bg-muted transition"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}