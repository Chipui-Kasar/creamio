"use client";

import { useEffect, useState } from "react";

export interface DeviceInfo {
  /** Primary input is touch (phones / tablets). */
  coarse: boolean;
  /** Small screen or low-memory hint → cheaper rendering. */
  lowPower: boolean;
  webgl: boolean;
  ready: boolean;
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>({ coarse: false, lowPower: false, webgl: true, ready: false });
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
    const small = window.innerWidth < 820;
    setInfo({ coarse, lowPower: coarse || small || mem <= 4, webgl: hasWebGL(), ready: true });
  }, []);
  return info;
}
