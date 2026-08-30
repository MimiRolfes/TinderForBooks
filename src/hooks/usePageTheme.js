import { useEffect } from "react";

// iOS Safari paints the area behind the status bar with the *document*
// background colour, not with the page element's. So every screen pushes its
// own background colour onto <html>/<body> and theme-color — otherwise a
// strip of the wrong colour shows up at the top of the screen.
export function usePageTheme(color) {
  useEffect(() => {
    document.documentElement.style.background = color;
    document.body.style.background = "transparent";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
  }, [color]);
}
