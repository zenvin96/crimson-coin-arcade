import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "register";

const LoginForm = ({ setMode }: { setMode: (mode: AuthMode) => void }) => {
  const { login, isLoading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back to CrimsonCoin!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your email and password",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="youremail@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button
            type="button"
            variant="link"
            className="text-xs text-primary p-0"
          >
            Forgot password?
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="gradient-button w-full"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          Don't have an account?{" "}
        </span>
        <Button
          type="button"
          variant="link"
          className="text-primary p-0"
          onClick={() => setMode("register")}
        >
          Register
        </Button>
      </div>
    </form>
  );
};

const RegisterForm = ({ setMode }: { setMode: (mode: AuthMode) => void }) => {
  const { login, isLoading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // For now, we'll just use login since this is a mock
      await login(email, password);
      toast({
        title: "Registration successful",
        description: "Welcome to CrimsonCoin!",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="youremail@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="gradient-button w-full"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          Already have an account?{" "}
        </span>
        <Button
          type="button"
          variant="link"
          className="text-primary p-0"
          onClick={() => setMode("login")}
        >
          Login
        </Button>
      </div>
    </form>
  );
};

const AuthButtons = () => {
  const { isAuthenticated, logout } = useApp();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          My Account
        </Button>
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              setAuthMode("login");
              setIsDialogOpen(true);
            }}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === "login"
                ? "Sign In to Your Account"
                : "Create an Account"}
            </DialogTitle>
            <DialogDescription>
              {authMode === "login"
                ? "Enter your credentials to access your account"
                : "Fill out the form below to create your account"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {authMode === "login" ? (
              <LoginForm setMode={setAuthMode} />
            ) : (
              <RegisterForm setMode={setAuthMode} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button
        className="gradient-button"
        onClick={() => {
          setAuthMode("register");
          setIsDialogOpen(true);
        }}
      >
        Sign Up
      </Button>
    </div>
  );
};

export default AuthButtons;
