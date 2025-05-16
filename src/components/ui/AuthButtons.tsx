import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "register";

const LoginForm = ({ setMode }: { setMode: (mode: AuthMode) => void }) => {
  const { t } = useTranslation();
  const { login, isLoading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast({
        title: t("auth.loginSuccessTitle"),
        description: t("auth.loginSuccessDesc"),
      });
    } catch (error) {
      toast({
        title: t("auth.loginFailTitle"),
        description: t("auth.loginFailDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
          <Button
            type="button"
            variant="link"
            className="text-xs text-primary p-0"
          >
            {t("auth.forgotPassword")}
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
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
        {isLoading ? t("auth.loggingInButton") : t("auth.loginButton")}
      </Button>
      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
        </span>
        <Button
          type="button"
          variant="link"
          className="text-primary p-0"
          onClick={() => setMode("register")}
        >
          {t("auth.registerLink")}
        </Button>
      </div>
    </form>
  );
};

const RegisterForm = ({ setMode }: { setMode: (mode: AuthMode) => void }) => {
  const { t } = useTranslation();
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
        title: t("auth.registerSuccessTitle"),
        description: t("auth.registerSuccessDesc"),
      });
    } catch (error) {
      toast({
        title: t("auth.registerFailTitle"),
        description: t("auth.registerFailDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("auth.fullNameLabel")}</Label>
        <Input
          id="name"
          type="text"
          placeholder={t("auth.fullNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t("auth.createPasswordPlaceholder")}
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
        {isLoading
          ? t("auth.creatingAccountButton")
          : t("auth.createAccountButton")}
      </Button>
      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
        </span>
        <Button
          type="button"
          variant="link"
          className="text-primary p-0"
          onClick={() => setMode("login")}
        >
          {t("auth.loginLink")}
        </Button>
      </div>
    </form>
  );
};

const AuthButtons = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useApp();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: t("auth.logoutSuccessTitle"),
      description: t("auth.logoutSuccessDesc"),
    });
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {t("auth.myAccountButton")}
        </Button>
        <Button variant="ghost" onClick={handleLogout}>
          {t("auth.logoutButton")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
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
            {t("auth.signInButton")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === "login"
                ? t("auth.loginTitle")
                : t("auth.registerTitle")}
            </DialogTitle>
            <DialogDescription>
              {authMode === "login"
                ? t("auth.loginDesc")
                : t("auth.registerDesc")}
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
        className="gradient-button flex items-center gap-2"
        onClick={() => {
          setAuthMode("register");
          setIsDialogOpen(true);
        }}
      >
        {t("auth.signUpButton")}
      </Button>
    </div>
  );
};

export default AuthButtons;
