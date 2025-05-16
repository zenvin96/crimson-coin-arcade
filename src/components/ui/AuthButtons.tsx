import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { LogIn, User, Twitter, MessageCircle, Send } from "lucide-react";
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
        <Label htmlFor="email" className="text-pink-400">{t("auth.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-pink-400">{t("auth.passwordLabel")}</Label>
          <Button
            type="button"
            variant="link"
            className="text-xs text-pink-500 hover:text-pink-400 p-0"
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
          className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
        />
      </div>
      <Button
        type="submit"
        className="gradient-button w-full hover:shadow-[0_0_15px_3px_rgba(236,72,153,0.6)] transition-shadow duration-300"
        disabled={isLoading}
      >
        {isLoading ? t("auth.loggingInButton") : t("auth.loginButton")}
      </Button>
      
      <div className="my-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-2 text-neutral-500">
              {t("auth.orContinueWith")}
            </span>
          </div>
        </div>

        <div className="mt-6 flex  justify-around gap-3">
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">G</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <Send className="h-5 w-5 text-neutral-400" />
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">M</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <Twitter className="h-5 w-5 text-neutral-400" />
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">WC</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-neutral-400" />
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">L</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">Z</span>
          </Button>
        </div>
      </div>

      <div className="text-center">
        <span className="text-sm text-neutral-400">
          {t("auth.noAccount")}{" "}
        </span>
        <Button
          type="button"
          variant="link"
          className="text-pink-500 hover:text-pink-400 p-0"
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
        <Label htmlFor="name" className="text-pink-400">{t("auth.fullNameLabel")}</Label>
        <Input
          id="name"
          type="text"
          placeholder={t("auth.fullNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-pink-400">{t("auth.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-pink-400">{t("auth.passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t("auth.createPasswordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
        />
      </div>
      <Button
        type="submit"
        className="gradient-button w-full hover:shadow-[0_0_15px_3px_rgba(236,72,153,0.6)] transition-shadow duration-300"
        disabled={isLoading}
      >
        {isLoading
          ? t("auth.creatingAccountButton")
          : t("auth.createAccountButton")}
      </Button>

      <div className="my-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-2 text-neutral-500">
              {t("auth.orContinueWith")}
            </span>
          </div>
        </div>

        <div className="mt-6 flex  justify-around gap-3">
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">G</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <Send className="h-5 w-5 text-neutral-400" />
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">M</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <Twitter className="h-5 w-5 text-neutral-400" />
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">WC</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-neutral-400" />
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">L</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center">
            <span className="font-bold text-neutral-400">Z</span>
          </Button>
        </div>
      </div>

      <div className="text-center">
        <span className="text-sm text-neutral-400">
          {t("auth.hasAccount")}{" "}
        </span>
        <Button
          type="button"
          variant="link"
          className="text-pink-500 hover:text-pink-400 p-0"
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
        <DialogContent className="sm:max-w-md bg-neutral-900 border border-pink-600/70 shadow-2xl shadow-pink-600/30 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-pink-400">
              {authMode === "login"
                ? t("auth.loginTitle")
                : t("auth.registerTitle")}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
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
