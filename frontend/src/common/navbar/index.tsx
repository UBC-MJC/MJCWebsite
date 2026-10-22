import { memo, useContext, useId, useState } from "react";
import { AppBar, Box, Drawer, IconButton, Skeleton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation } from "react-router";
import { AuthContext } from "@/common/AuthContext";
import { LoginButton, NewGameMenu } from "./BarActions";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import Wordmark from "./Wordmark";
import { DESKTOP } from "./navLinks";

// Below DESKTOP the bar is the menu button, the wordmark and one action (New game, or Log in when signed out),
// and the links live in the drawer. Both layouts are rendered and CSS picks one, so phones don't flash the desktop
// links while a media query resolves
const NavBar = () => {
    const { player, loading, logout } = useContext(AuthContext);
    const { pathname } = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeDrawer = () => setDrawerOpen(false);
    const drawerId = useId();

    return (
        <>
            {/* Hidden until focused: the first Tab press offers a jump past the bar */}
            <Box
                component="a"
                href="#main-content"
                sx={(theme) => ({
                    position: "absolute",
                    top: 8,
                    left: 16,
                    zIndex: theme.zIndex.appBar + 1,
                    px: 2,
                    py: 1.25,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    color: "text.primary",
                    fontWeight: 600,
                    textDecoration: "none",
                    outline: `2px solid ${theme.palette.primary.main}`,
                    transform: "translateY(-200%)",
                    "&:focus": { transform: "none" },
                })}
            >
                Skip to content
            </Box>
            <AppBar position="static" color="inherit">
                <Toolbar disableGutters>
                    {/* Same width and side padding as the page's Container (lg), so the wordmark sits over the
                        page heading and the bar's right edge over the content's */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            alignSelf: "stretch",
                            gap: 1,
                            width: "100%",
                            maxWidth: "lg",
                            mx: "auto",
                            px: { xs: 2, md: 3 },
                        }}
                    >
                        <IconButton
                            color="inherit"
                            aria-label="Open menu"
                            aria-haspopup="dialog"
                            aria-expanded={drawerOpen}
                            aria-controls={drawerOpen ? drawerId : undefined}
                            edge="start"
                            onClick={() => setDrawerOpen(true)}
                            sx={{ display: { [DESKTOP]: "none" } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Wordmark />
                        <Box sx={{ display: { [DESKTOP]: "none" }, ml: "auto" }}>
                            {loading ? (
                                <Skeleton variant="rounded" width={112} height={44} />
                            ) : player ? (
                                <NewGameMenu pathname={pathname} />
                            ) : (
                                <LoginButton />
                            )}
                        </Box>
                        <DesktopNav
                            player={player}
                            loading={loading}
                            pathname={pathname}
                            onLogout={logout}
                        />
                    </Box>
                </Toolbar>
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={closeDrawer}
                    // MUI leaves the panel an unnamed element; screen readers should hear a named modal dialog
                    slotProps={{
                        paper: {
                            id: drawerId,
                            role: "dialog",
                            "aria-modal": true,
                            "aria-label": "Site menu",
                        },
                    }}
                >
                    <MobileDrawer
                        player={player}
                        loading={loading}
                        pathname={pathname}
                        onClose={closeDrawer}
                        onLogout={logout}
                    />
                </Drawer>
            </AppBar>
        </>
    );
};

export default memo(NavBar);
