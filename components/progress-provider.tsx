"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";

export const ProgressProvider = ({
  children,
}: {
  readonly children: ReactNode;
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <ProgressBar
          height="6px"
          color={theme === "dark" ? "#ffffff" : "#000000"}
          options={{ showSpinner: true }}
          shallowRouting
        />
      )}
    </>
  );
};
