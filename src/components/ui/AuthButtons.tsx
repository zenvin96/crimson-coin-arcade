import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { LogIn, User, Twitter, MessageCircle, Send } from "lucide-react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/lib/validations/auth";

type AuthMode = "login" | "register";

const LoginForm = ({ setMode, onSuccess }: { setMode: (mode: AuthMode) => void; onSuccess: () => void }) => {
  const { t } = useTranslation();
  const { login, isLoading, loginWithGoogle } = useApp();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast({
        title: t("auth.loginSuccessTitle"),
        description: t("auth.loginSuccessDesc"),
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t("auth.loginFailTitle"),
        description: error instanceof Error ? error.message : t("auth.loginFailDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 min-h-[29rem]">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pink-400">
                {t("auth.emailLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-pink-400">
                  {t("auth.passwordLabel")}
                </FormLabel>
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-pink-500 hover:text-pink-400 p-0"
                >
                  {t("auth.forgotPassword")}
                </Button>
              </div>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                loginWithGoogle();
              }}
              type="button"
              title={t("auth.signInWithGoogle")}
            >
              <GoogleIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <Send className="h-5 w-5 text-neutral-400" />
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <span className="font-bold text-neutral-400">M</span>
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <Twitter className="h-5 w-5 text-neutral-400" />
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <span className="font-bold text-neutral-400">WC</span>
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 text-neutral-400" />
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <span className="font-bold text-neutral-400">L</span>
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <span className="font-bold text-neutral-400">Z</span>
            </Button>
          </div>
        </div>

        <div className="text-center">
          <span className="text-sm text-neutral-400">{t("auth.noAccount")} </span>
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
    </Form>
  );
};

const RegisterForm = ({ setMode, onSuccess }: { setMode: (mode: AuthMode) => void; onSuccess: () => void }) => {
  const { t } = useTranslation();
  const { register, isLoading, loginWithGoogle } = useApp();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data.email, data.password);
      toast({
        title: t("auth.registerSuccessTitle"),
        description: t("auth.registerSuccessDesc"),
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t("auth.registerFailTitle"),
        description: error instanceof Error ? error.message : t("auth.registerFailDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 min-h-[29rem]">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pink-400">
                {t("auth.emailLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pink-400">
                {t("auth.passwordLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.createPasswordPlaceholder")}
                  className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pink-400">
                {t("auth.confirmPasswordLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  className="bg-neutral-800 border-neutral-700 focus:border-pink-500 focus:ring-0 focus:outline-none text-neutral-200 placeholder:text-neutral-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                loginWithGoogle();
              }}
              type="button"
              title={t("auth.signInWithGoogle")}
            >
              <GoogleIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <Send className="h-5 w-5 text-neutral-400" />
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <span className="font-bold text-neutral-400">M</span>
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <Twitter className="h-5 w-5 text-neutral-400" />
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <span className="font-bold text-neutral-400">WC</span>
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 text-neutral-400" />
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
              <span className="font-bold text-neutral-400">L</span>
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 aspect-square p-0 h-10 flex items-center justify-center"
            >
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
    </Form>
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
        <DialogContent className="sm:max-w-[calc(28rem+300px)] bg-neutral-900 border border-pink-600/70 shadow-2xl shadow-pink-600/30 rounded-lg p-0 overflow-hidden">
          <div className="flex">
            <div className="sm:w-[28rem] p-6">
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
                  <LoginForm setMode={setAuthMode} onSuccess={() => setIsDialogOpen(false)} />
                ) : (
                  <RegisterForm setMode={setAuthMode} onSuccess={() => setIsDialogOpen(false)} />
                )}
              </div>
            </div>
            <div className="hidden sm:block w-[300px] h-auto relative">
              <img
                src="/register-min.jpg"
                alt="Register Visual"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-r-lg"
              />
            </div>
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