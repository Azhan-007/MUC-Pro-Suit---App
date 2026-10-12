"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Portals action buttons (Export, Add, etc.) into the top sticky navbar.
 */
export function NavbarActions({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const target = document.getElementById("navbar-actions");
  if (!target) return null;

  return createPortal(children, target);
}
