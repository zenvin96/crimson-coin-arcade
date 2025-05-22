import { useContext } from "react";
import { AppContext } from "./app.context";
import { AppContextType } from "./AppContextType";

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context as AppContextType; // Cast to AppContextType to ensure type safety
};
