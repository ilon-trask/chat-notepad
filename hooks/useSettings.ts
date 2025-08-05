import { Settings } from "@/types/settings";
import { useState } from "react";

export default function useSettings() {
  const _settings = localStorage.getItem("settings");
  const [settings, _setSettings] = useState<Settings>(
    JSON.parse(_settings || `{"privateMode":"false"}`) as Settings
  );

  const setSettings = (settings: Settings) => {
    localStorage.setItem("settings", JSON.stringify(settings));
    _setSettings(settings);
  };
  return { settings, setSettings };
}
