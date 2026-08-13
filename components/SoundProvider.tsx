"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "shijian-sound";

const SoundContext = createContext<{ enabled: boolean; toggle: () => void }>({
  enabled: false,
  toggle: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "on") setEnabled(true);
  }, []);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  };

  return (
    <SoundContext.Provider value={{ enabled, toggle }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
