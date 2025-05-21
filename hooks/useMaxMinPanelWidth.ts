import { useEffect, useState } from "react";

export default function useMaxMinPanelWidth(
    defaultMinSize: number = 15,
    defaultMaxSize: number = 30
) {
    const [minSize, setMinSize] = useState(defaultMinSize);
    const [maxSize, setMaxSize] = useState(defaultMaxSize);
    useEffect(() => {
        const calculateMinSize = () => {
          const windowWidth = window.innerWidth;
          const newMinSize = Math.ceil((250 / windowWidth) * 100);
          const newMaxSize = Math.ceil((80 / windowWidth) * 100);
          setMinSize(newMinSize);
          setMaxSize(newMaxSize);
        };
    
        calculateMinSize();
    
        window.addEventListener("resize", calculateMinSize);
    
        return () => {
          window.removeEventListener("resize", calculateMinSize);
        };
      }, []);
      return { minSize, maxSize };
}
