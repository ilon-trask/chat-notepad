import { useEffect, useState } from "react";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  const updateSize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      updateSize();

      window.addEventListener("resize", updateSize);
      return (): void => window.removeEventListener("resize", updateSize);
    }
  }, []);

  return isMobile;
}
