import { createContext } from "react";
import { AppContextType } from "./AppContextType";

export const AppContext = createContext<AppContextType | undefined>(undefined);
