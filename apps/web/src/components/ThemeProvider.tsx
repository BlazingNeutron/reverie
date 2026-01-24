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
    root.classList.remove("light");
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  };

  return (
    <ThemeContext.Provider value={{dark, toggle : () => setDark(!dark) }}>
        <Theme appearance={dark ? "dark" : "light"} panelBackground="solid">
            {children}
        </Theme>
    </ThemeContext.Provider>
  );
}
