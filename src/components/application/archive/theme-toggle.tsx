import { Moon01, Sun } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { useTheme } from "@/providers/theme-provider";

export const ThemeToggle = () => {
    const { setTheme, theme } = useTheme();
    const isDarkMode = theme === "dark";

    return (
        <Button
            aria-label={isDarkMode ? "Açık temaya geç" : "Koyu temaya geç"}
            color="secondary"
            iconLeading={isDarkMode ? Sun : Moon01}
            size="lg"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
        />
    );
};
