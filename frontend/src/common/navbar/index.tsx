import { memo, useContext, useId, useState } from "react";
import { AppBar, Box, Button, Drawer, IconButton, Skeleton, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation } from "react-router";
import { AuthContext } from "@/common/AuthContext";
import { LoginButton, NewGameMenu } from "./BarActions";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import Wordmark from "./Wordmark";
import { DESKTOP } from "./navLinks";

const SkipLink = styled(Button)(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(1),
    left: theme.spacing(2),
    zIndex: theme.zIndex.appBar + 1,
    transform: "translateY(-200%)",
    "&:focus": { transform: "none" },
})) as typeof Button;

// Both layouts render and CSS picks one, so phones never flash the desktop links
const NavBar = () => {
    const { player, loading, logout } = useContext(AuthContext);
    const { pathname } = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeDrawer = () => setDrawerOpen(false);
    const drawerId = useId();

    return (
        <>
            <SkipLink variant="contained" href="#main-content">
                Skip to content
            </SkipLink>
            <AppBar position="static" color="inherit">
                {/* The page Container's width and gutters, so the bar lines up with the content */}
                <Toolbar
                    sx={{ width: "100%", maxWidth: "lg", mx: "auto", gap: 1, px: { sm: 2, md: 3 } }}
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
                </Toolbar>
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={closeDrawer}
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
