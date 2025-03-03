
import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    
    // Save to user profile if logged in
    const saveThemePreference = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("profiles")
            .update({ 
              theme_preference: theme
            })
            .eq("id", user.id);

          if (error) {
            console.error("Error saving theme preference:", error);
          } else {
            console.log("Theme preference saved:", theme);
          }
        }
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    };
    
    saveThemePreference();
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
