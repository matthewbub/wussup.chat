import { useState, useEffect } from "react";

export const useDarkReader = () => {
  const [isDarkReader, setIsDarkReader] = useState<boolean>(false);

  useEffect(() => {
    // check initial state
    const checkDarkReader = () => {
      const isDark =
        document.documentElement.getAttribute("data-darkreader-scheme") ===
        "dark";
      setIsDarkReader(isDark);
    };

    // check immediately
    checkDarkReader();

    // set up mutation observer to watch for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-darkreader-scheme") {
          checkDarkReader();
        }
      });
    });

    // start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-darkreader-scheme"],
    });

    // cleanup
    return () => observer.disconnect();
  }, []);

  return isDarkReader;
};
