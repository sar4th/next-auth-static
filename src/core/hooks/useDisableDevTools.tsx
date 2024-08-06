import { useEffect } from "react";

const useDisableDevTools = (): void => {
  useEffect(() => {
    // Disable right-click
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", disableRightClick);

    // Disable certain keyboard shortcuts
    const disableDevToolsShortcut = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.metaKey && e.altKey && e.key === "I")
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", disableDevToolsShortcut);

    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableDevToolsShortcut);
    };
  }, []);
};

export default useDisableDevTools;
