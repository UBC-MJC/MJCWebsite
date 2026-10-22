import { memo, useContext, useState } from "react";
import { AppBar, Box, Drawer, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation } from "react-router";
import { AuthContext } from "@/common/AuthContext";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import { NewGameMenu } from "./NavMenu";
import Wordmark from "./Wordmark";
import { DESKTOP } from "./navLinks";

// Below DESKTOP the bar is the menu button, the wordmark and New game, and the links live in the drawer. Both
// layouts are rendered and CSS picks one, so phones don't flash the desktop links while a media query resolves
const NavBar = () => {
    const { player, loading, logout } = useContext(AuthContext);
    const { pathname } = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeDrawer = () => setDrawerOpen(false);

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
                <Toolbar sx={{ gap: 1 }}>
                    <IconButton
                        color="inherit"
                        aria-label="Open menu"
                        aria-expanded={drawerOpen}
                        edge="start"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ display: { [DESKTOP]: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Wordmark />
                    {!loading && player && (
                        <Box sx={{ display: { [DESKTOP]: "none" }, ml: "auto" }}>
                            <NewGameMenu pathname={pathname} />
                        </Box>
                    )}
                    <DesktopNav
                        player={player}
                        loading={loading}
                        pathname={pathname}
                        onLogout={logout}
                    />
                </Toolbar>
                <Drawer anchor="left" open={drawerOpen} onClose={closeDrawer}>
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
