import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { setToken } from "@/services/api/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useApp();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(true);
  
  // Check if this is running in a popup window
  const isPopup = window.opener !== null;

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          if (isPopup && window.opener) {
            // Send error message to parent window
            window.opener.postMessage({
              type: 'google-auth-error',
              error: error || t("auth.googleSignInFailDesc")
            }, window.location.origin);
            window.close();
          } else {
            toast({
              title: t("auth.googleSignInFailTitle"),
              description: error || t("auth.googleSignInFailDesc"),
              variant: "destructive",
            });
            navigate("/");
          }
          return;
        }

        if (!token) {
          if (isPopup && window.opener) {
            // Send error message to parent window
            window.opener.postMessage({
              type: 'google-auth-error',
              error: t("auth.noTokenReceived")
            }, window.location.origin);
            window.close();
          } else {
            toast({
              title: t("auth.googleSignInFailTitle"),
              description: t("auth.noTokenReceived"),
              variant: "destructive",
            });
            navigate("/");
          }
          return;
        }

        // Set the token in localStorage
        setToken(token);

        if (isPopup && window.opener) {
          // If in popup, just send the token to parent and let parent handle auth check
          window.opener.postMessage({
            type: 'google-auth-success',
            token: token
          }, window.location.origin);
          window.close();
        } else {
          // If not in popup, check authentication normally
          const user = await checkAuth();
          
          if (user) {
            toast({
              title: t("auth.loginSuccessTitle"),
              description: t("auth.loginSuccessDesc"),
            });
            navigate("/");
          } else {
            toast({
              title: t("auth.googleSignInFailTitle"),
              description: t("auth.authenticationFailed"),
              variant: "destructive",
            });
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error during OAuth callback:", error);
        if (isPopup && window.opener) {
          // Send error message to parent window
          window.opener.postMessage({
            type: 'google-auth-error',
            error: error instanceof Error ? error.message : t("auth.googleSignInFailDesc")
          }, window.location.origin);
          window.close();
        } else {
          toast({
            title: t("auth.googleSignInFailTitle"),
            description: error instanceof Error ? error.message : t("auth.googleSignInFailDesc"),
            variant: "destructive",
          });
          navigate("/");
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuth, toast, t, isPopup]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-neutral-400">{t("auth.processingSignIn")}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;