import React, { useState, useLayoutEffect, type ReactElement } from "react";
import { Theme } from '@radix-ui/themes';

export const ThemeContext = React.createContext({
  dark: false,
  toggle: () => {}
});

export default function ThemeProvider({ children }:{children:ReactElement}) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  const [dark, setDark] = useState(prefersDark);

  useLayoutEffect(() => {
    applyTheme();
  }, [dark]);

  const applyTheme = () => {
    const root : HTMLElement | any = document.getElementsByTagName("html")[0];
    if (!root) return;
    root.classList.remove("dark");
    if (dark) {
      root.classList.add("dark");
    }
  };

  const toggle = () => {
    const body : HTMLElement | any = document.getElementsByTagName("body")[0];
    body.style.cssText = "transition: background .5s ease";

    setDark(!dark);
  };

  return (
    <ThemeContext.Provider value={{dark, toggle}}>
        <Theme appearance={dark ? "dark" : "light"}>
            {children}
        </Theme>
    </ThemeContext.Provider>
  );
}
