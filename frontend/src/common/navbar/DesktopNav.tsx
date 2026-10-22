import { Box, Button, Divider, MenuItem, Skeleton } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Link } from "react-router";
import type { Player } from "@/types";
import { NavMenu, NewGameMenu, menuLink } from "./NavMenu";
import {
    DESKTOP,
    adminLink,
    isItemActive,
    isLinkActive,
    isNavGroup,
    loginLink,
    mainNav,
    settingsLink,
} from "./navLinks";

// Links fill the bar's height so the current page's link can put an ink bar on the bar's bottom edge, like a tab.
// The bar, not just the colour, marks the page, and the weight never changes so labels don't shift. The focus ring
// sits inside because the link is as tall as the bar, and an open menu's trigger reads as current.
// minHeight is restated because passing `sx` replaces the theme's default Button `sx`
const navLinkSx = (active: boolean): SxProps<Theme> => ({
    alignSelf: "stretch",
    position: "relative",
    minWidth: 0,
    minHeight: 44,
    px: 1.5,
    borderRadius: 0,
    color: active ? "text.primary" : "text.secondary",
    fontSize: "1rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    transition: "color 150ms ease-out",
    "&::after": {
        content: '""',
        position: "absolute",
        left: 12,
        right: 12,
        bottom: -1, // over the bar's bottom border
        height: 2,
        bgcolor: "primary.main",
        opacity: active ? 1 : 0,
    },
    "&.Mui-focusVisible": { outlineOffset: -2 },
    "&[aria-expanded=true]": { color: "text.primary" },
    "& .MuiButton-endIcon": { ml: 0.25 },
    "@media (hover: hover)": {
        "&:hover": { color: "text.primary", bgcolor: "transparent" },
    },
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

interface DesktopNavProps {
    player: Player | undefined;
    loading: boolean;
    pathname: string;
    onLogout: () => void;
}

const DesktopNav = ({ player, loading, pathname, onLogout }: DesktopNavProps) => {
    const accountActive = [settingsLink, adminLink].some((link) => isLinkActive(pathname, link));

    return (
        <Box
            sx={{
                display: { xs: "none", [DESKTOP]: "flex" },
                alignSelf: "stretch",
                flexGrow: 1,
                ml: 1,
            }}
        >
            <Box component="nav" aria-label="Main" sx={{ display: "flex" }}>
                {mainNav.map((item) => {
                    const active = isItemActive(pathname, item);
                    return isNavGroup(item) ? (
                        <NavMenu
                            key={item.label}
                            label={item.label}
                            triggerProps={{ sx: navLinkSx(active) }}
                        >
                            {item.links.map((link) => menuLink(link, pathname))}
                        </NavMenu>
                    ) : (
                        <Button
                            key={item.label}
                            color="inherit"
                            component={Link}
                            to={item.to}
                            aria-current={active ? "page" : undefined}
                            sx={navLinkSx(active)}
                        >
                            {item.label}
                        </Button>
                    );
                })}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    ml: "auto",
                    pl: 2,
                    minWidth: 0,
                }}
            >
                {loading ? (
                    <Skeleton variant="rounded" width={200} height={44} />
                ) : player ? (
                    <>
                        <NewGameMenu pathname={pathname} />
                        <NavMenu
                            label={
                                <Box
                                    component="span"
                                    sx={{
                                        display: "block",
                                        minWidth: 0,
                                        maxWidth: 160,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {player.username}
                                </Box>
                            }
                            align="right"
                            triggerProps={{ sx: navLinkSx(accountActive) }}
                        >
                            {menuLink(settingsLink, pathname)}
                            {player.admin && menuLink(adminLink, pathname)}
                            <Divider />
                            <MenuItem onClick={onLogout}>Log out</MenuItem>
                        </NavMenu>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        component={Link}
                        to={loginLink.to}
                        sx={{ minHeight: 44, px: 2, whiteSpace: "nowrap" }}
                    >
                        {loginLink.label}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default DesktopNav;
