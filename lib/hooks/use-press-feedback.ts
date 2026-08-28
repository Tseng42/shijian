"use client";

import { useCallback, useRef, useState } from "react";

// 保證「壓下」的視覺回饋至少可見這麼久，避免使用者快速點擊時
// pointerdown/up 間隔太短、壓下的樣式根本沒被畫出來一幀就被放開的狀態蓋掉。
const MIN_PRESS_MS = 120;

export function usePressFeedback() {
  const [pressed, setPressed] = useState(false);
  const downAtRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const onPointerDown = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    downAtRef.current = Date.now();
    setPressed(true);
  }, []);

  const release = useCallback(() => {
    const elapsed = Date.now() - downAtRef.current;
    const wait = Math.max(0, MIN_PRESS_MS - elapsed);
    timeoutRef.current = setTimeout(() => setPressed(false), wait);
  }, []);

  return {
    pressed,
    handlers: {
      onPointerDown,
      onPointerUp: release,
      onPointerLeave: release,
      onPointerCancel: release,
    },
  };
}
