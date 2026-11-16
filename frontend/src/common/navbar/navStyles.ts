import type { Theme } from "@mui/material/styles";

const currentMark = (theme: Theme) =>
    ({
        content: '""',
        position: "absolute",
        backgroundColor: theme.palette.primary.main,
        // Forced colours would repaint the mark as Canvas, hiding it
        "@media (forced-colors: active)": {
            forcedColorAdjust: "none",
            backgroundColor: "CanvasText",
        },
    }) as const;

export const leadingBar = (theme: Theme) => ({
    ...currentMark(theme),
    left: 0,
    top: theme.spacing(1),
    bottom: theme.spacing(1),
    width: 3,
});
