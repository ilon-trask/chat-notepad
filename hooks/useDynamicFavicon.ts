"use client";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function useDynamicFavicon() {
  const theme = useTheme();
  useEffect(() => {
    const existingFavicons = document.querySelectorAll('link[rel="icon"]');
    existingFavicons.forEach((favicon) => favicon.remove());

    // Create new favicon
    const link = document.createElement("link");
    link.rel = "icon";

    if (theme.theme === "dark") {
      // Use emoji as favicon
      link.href = "/logo-black.svg";
    } else {
      // Use image as favicon
      link.href = "/logo-white.svg";
    }

    document.head.appendChild(link);
  }, [theme.theme]);

  return null;
}
