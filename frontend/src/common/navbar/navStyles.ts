import type { Theme } from "@mui/material/styles";

export const leadingBar = (theme: Theme) =>
    ({
        content: '""',
        position: "absolute",
        left: 0,
        top: theme.spacing(1),
        bottom: theme.spacing(1),
        width: 3,
        backgroundColor: theme.palette.primary.main,
        // Forced colours would repaint the bar as Canvas, hiding it
        "@media (forced-colors: active)": {
            forcedColorAdjust: "none",
            backgroundColor: "CanvasText",
        },
    }) as const;
