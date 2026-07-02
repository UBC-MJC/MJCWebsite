import { useContext, memo, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    Box,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "@/common/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { gradientTitle } from "@/theme/utils";
import { EASE } from "./navStyles";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";

const NavBar = () => {
    const { player, loading, logout } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const location = useLocation();

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const handleDrawerToggle = () => setMobileDrawerOpen(!mobileDrawerOpen);
    const closeDrawer = () => setMobileDrawerOpen(false);

    return (
        <AppBar
            position="sticky"
            color="primary"
            sx={{
                zIndex: (t) => t.zIndex.drawer + 1,
                transition: `box-shadow 0.3s ${EASE}, background-color 0.3s ${EASE}`,
                // Translucent frosted bar; text adapts to the scheme so it stays
                // legible on the dark (near-black) and light (near-white) bars alike.
                bgcolor: "var(--mui-palette-glass-bar)",
                color: "text.primary",
                borderBottom: (t) => `0px solid ${t.palette.primary.main}`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                "@supports not ((backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)))": {
                    bgcolor: "var(--mui-palette-background-default)",
                },
            }}
        >
            <Toolbar sx={{ minHeight: { xs: 64, md: 76 }, px: { xs: 2, md: 3 } }}>
                {isMobile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 1.5,
                            transition: `transform 0.25s ${EASE}`,
                            "@media (hover: hover)": {
                                "&:hover": { transform: "scale(1.15) rotate(6deg)" },
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                <Box
                    component={Link}
                    to="/"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "inherit",
                        textDecoration: "none",
                        mr: { xs: "auto", md: 3 },
                        transition: `opacity 0.2s ${EASE}`,
                        "&:hover": { opacity: 0.95 },
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            ...gradientTitle,
                            fontSize: { xs: "1.15rem", md: "1.35rem" },
                            transition: `transform 0.25s ${EASE}, letter-spacing 0.25s ${EASE}`,
                            transformOrigin: "left center",
                            "@media (hover: hover)": {
                                "&:hover": {
                                    transform: "translateX(2px) scale(1.04)",
                                    letterSpacing: "0.01em",
                                },
                            },
                        }}
                    >
                        UBC MJC
                    </Typography>
                </Box>

                {!isMobile && (
                    <DesktopNav
                        player={player}
                        loading={loading}
                        pathname={location.pathname}
                        onLogout={logout}
                    />
                )}
            </Toolbar>

            <Drawer
                anchor="left"
                open={mobileDrawerOpen}
                onClose={handleDrawerToggle}
                transitionDuration={300}
            >
                <MobileDrawer
                    player={player}
                    loading={loading}
                    pathname={location.pathname}
                    onClose={closeDrawer}
                    onLogout={logout}
                />
            </Drawer>
        </AppBar>
    );
};

export default memo(NavBar);
