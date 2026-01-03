import React from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  toggleTheme: () => void;
  isDark: boolean;
}

export default function ThemeToggle({ toggleTheme, isDark }: ThemeToggleProps) {
  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    const x = e.clientX;
    const y = e.clientY;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.startViewTransition(() => {
      toggleTheme();
    });

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <button
      onClick={handleThemeToggle}
      className="cursor-pointer p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

