import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";

const AuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const message = searchParams.get("message") || t("auth.unknownError");
    
    toast({
      title: t("auth.authenticationError"),
      description: message,
      variant: "destructive",
    });

    // Redirect to home after showing the error
    const timeout = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [searchParams, navigate, toast, t]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">{t("auth.authenticationError")}</h1>
        <p className="text-neutral-400 mb-4">
          {searchParams.get("message") || t("auth.unknownError")}
        </p>
        <p className="text-sm text-neutral-500">{t("auth.redirectingHome")}</p>
      </div>
    </div>
  );
};

export default AuthError;