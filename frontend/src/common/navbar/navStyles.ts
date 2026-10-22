// An ink bar on the leading edge marks where you are: on the current page's row in the drawer and in every
// dropdown, matching the desktop bar's underline. Forced colours would repaint its background as Canvas and hide it
export const leadingBar = {
    content: '""',
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    bgcolor: "primary.main",
    "@media (forced-colors: active)": { forcedColorAdjust: "none", bgcolor: "CanvasText" },
};
