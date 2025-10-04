import { Settings } from "@/types/settings";
import { useEffect, useState } from "react";

const DEFAULT_SETTINGS: Settings = {
  privateMode: false,
};

export default function useSettings() {
  const [settings, _setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const setSettings = (settings: Settings) => {
    localStorage.setItem("settings", JSON.stringify(settings));
    _setSettings(settings);
  };

  useEffect(() => {
    const _settings = localStorage.getItem("settings");
    _setSettings(
      JSON.parse(_settings || `{"privateMode":"false"}`) as Settings
    );
  }, []);

  return { settings, setSettings };
}
