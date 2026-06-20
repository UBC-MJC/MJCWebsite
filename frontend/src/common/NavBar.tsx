import { useContext, memo, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Menu,
    MenuItem,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Box,
    useTheme,
    useMediaQuery,
    Divider,
    Collapse,
    Stack,
    Skeleton,
    ListItemButton,
    Fade,
    alpha,
    type MenuProps,
} from "@mui/material";
import { keyframes } from "@mui/system";
import type { SxProps, Theme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMore from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import { AuthContext } from "@/common/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { getGameVariantString } from "@/common/Utils";
import { palette, shadow, timing } from "@/theme/tokens";
import { gradientTitle } from "@/theme/utils";

// ─── Animations ────────────────────────────────────────────────────────────

const dropIn = keyframes`
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
`;

// Curtain reveal — unrolls a dropdown from top to bottom.
const openDown = keyframes`
    from { opacity: 0; clip-path: inset(0 0 100% 0); }
    to   { opacity: 1; clip-path: inset(0 0 0% 0);   }
`;

// Gentle "breathing" pulse for the live dot (matches LiveGames).
const pulse = keyframes`
    0%   { opacity: 1;    transform: scale(1);   }
    50%  { opacity: 0.35; transform: scale(0.8); }
    100% { opacity: 1;    transform: scale(1);   }
`;

const EASE = `cubic-bezier(0.4, 0, 0.2, 1)`;

/**
 * Hover nudge shared by every nav button — a small rightward slide that
 * mirrors the drawer's text animation (theme ListItemButton padding-left),
 * done with translateX so horizontal buttons don't reflow their neighbors.
 */
const HOVER_TRANSFORM = "translateX(4px)";

/** Spreadable base for any interactive nav button (origin + easing). */
const interactiveSx: SxProps<Theme> = {
    transformOrigin: "left center",
    transition: `all ${timing.normal} ${EASE}`,
};

// ─── Shared styles ───────────────────────────────────────────────────────────

/** Top-level nav button with an animated underline indicator. */
const navBtnSx = (active: boolean): SxProps<Theme> => ({
    ...interactiveSx,
    position: "relative",
    minWidth: "auto",
    px: 1.75,
    py: 1,
    mx: 0.25,
    fontSize: "0.95rem",
    fontWeight: active ? 700 : 500,
    color: "inherit",
    borderRadius: 2,
    whiteSpace: "nowrap",
    "&::after": {
        content: '""',
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 6,
        height: "2px",
        borderRadius: "2px",
        // theme badgeLight blue, slightly opaque
        backgroundColor: palette.icon.badgeLight,
        opacity: 0.85,
        transform: active ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left center",
        transition: `transform 0.25s ${EASE}`,
    },
    "&:hover": {
        background: "rgba(255,255,255,0.14)",
        transform: HOVER_TRANSFORM,
        "&::after": { transform: "scaleX(1)" },
    },
});

/** Shared props for every dropdown menu — slides/grows out smoothly. */
const menuTransition = (
    origin: "left" | "right",
): Partial<MenuProps> => ({
    anchorOrigin: { vertical: "bottom", horizontal: origin },
    transformOrigin: { vertical: "top", horizontal: origin },
    TransitionComponent: Fade,
    transitionDuration: 260,
    slotProps: {
        paper: {
            sx: {
                mt: 1,
                overflow: "hidden",
                transformOrigin: "top center",
                boxShadow: shadow.nav,
                animation: `${openDown} 0.26s ${EASE}`,
                "& .MuiMenuItem-root": {
                    transition: `background ${timing.fast}, padding-left 0.18s ${EASE}`,
                    "&:hover": { pl: 2.4 },
                },
            },
        },
    },
});

const chevronSx = (open: boolean): SxProps<Theme> => ({
    fontSize: "1.05rem !important",
    transition: `transform 0.25s ${EASE}`,
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
});

// ─── Logo ────────────────────────────────────────────────────────────────────

const LogoIcon = () => (
    <Box
        className="nav-logo"
        sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 1.25,
            flexShrink: 0,
            transition: `transform 0.3s ${EASE}, background 0.3s ${EASE}`,
            "&:hover": {
                transform: "rotate(-8deg) scale(1.08)",
                background: "rgba(255,255,255,0.28)",
            },
        }}
    >
        <HomeFilledIcon sx={{ color: "white", fontSize: "1.4rem" }} aria-hidden="true" />
    </Box>
);

// ─── Component ─────────────────────────────────────────────────────────────────

const NavBar = () => {
    const { player, loading, logout } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const location = useLocation();

    const [leaderboardAnchor, setLeaderboardAnchor] = useState<null | HTMLElement>(null);
    const [recordGameAnchor, setRecordGameAnchor] = useState<null | HTMLElement>(null);
    const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const [leaderboardOpen, setLeaderboardOpen] = useState(false);
    const [recordGameOpen, setRecordGameOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const isActive = (path: string) => location.pathname.startsWith(path);
    // The combined Games page is served at both /games and /games/current —
    // highlight the nav entry for either, but not for /games/create or game detail pages.
    const isGamesActive =
        location.pathname === "/games" || location.pathname === "/games/current";

    const handleDrawerToggle = () => setMobileDrawerOpen(!mobileDrawerOpen);
    const closeDrawer = () => setMobileDrawerOpen(false);

    const leaderboardItems = [
        { to: "/leaderboard/jp", label: getGameVariantString("jp", "RANKED") },
        { to: "/leaderboard/jp/casual", label: getGameVariantString("jp", "CASUAL") },
        { to: "/leaderboard/hk", label: getGameVariantString("hk", "RANKED") },
        { to: "/leaderboard/hk/casual", label: getGameVariantString("hk", "CASUAL") },
    ];

    const recordGameItems = player
        ? [
              ...(player.japaneseQualified
                  ? [{ to: "/games/create/jp", label: getGameVariantString("jp", "RANKED") }]
                  : []),
              { to: "/games/create/jp/casual", label: getGameVariantString("jp", "CASUAL") },
              ...(player.hongKongQualified
                  ? [{ to: "/games/create/hk", label: getGameVariantString("hk", "RANKED") }]
                  : []),
              { to: "/games/create/hk/casual", label: getGameVariantString("hk", "CASUAL") },
          ]
        : [];

    // ─── Mobile drawer ──────────────────────────────────────────────────────

    const drawerItemSx = { animation: `${dropIn} 0.3s ${EASE} both` };

    const mobileDrawer = (
        <Box sx={{ width: 280 }} role="presentation">
            <Box
                sx={{
                    p: 2.5,
                    pb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: (t) => t.palette.primary.main,
                    color: "primary.contrastText",
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <LogoIcon />
                    <Typography variant="h6" fontWeight={800}>
                        UBC MJC
                    </Typography>
                </Stack>
                <IconButton size="small" onClick={closeDrawer} sx={{ color: "inherit" }} aria-label="close menu">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Divider />
            <List sx={{ px: 1, pt: 1.5 }}>
                <ListItemButton component={Link} to="/" onClick={closeDrawer} selected={location.pathname === "/"}>
                    <ListItemText primary="Home" primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 600 }} />
                </ListItemButton>

                <ListItem
                    onClick={() => setLeaderboardOpen(!leaderboardOpen)}
                    sx={{ cursor: "pointer", borderRadius: 2 }}
                >
                    <ListItemText primary="Leaderboard" primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 600 }} />
                    <ExpandMore fontSize="small" sx={chevronSx(leaderboardOpen)} />
                </ListItem>
                <Collapse in={leaderboardOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                        {leaderboardItems.map((item) => (
                            <ListItemButton key={item.to} component={Link} to={item.to} onClick={closeDrawer}>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: "0.875rem", color: "text.secondary" }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>

                {!loading && player && (
                    <>
                        <ListItem
                            onClick={() => setRecordGameOpen(!recordGameOpen)}
                            sx={{ cursor: "pointer", borderRadius: 2 }}
                        >
                            <ListItemText primary="Record Game" primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 600 }} />
                            <ExpandMore fontSize="small" sx={chevronSx(recordGameOpen)} />
                        </ListItem>
                        <Collapse in={recordGameOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 2 }}>
                                {recordGameItems.map((item) => (
                                    <ListItemButton key={item.to} component={Link} to={item.to} onClick={closeDrawer}>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{ fontSize: "0.875rem", color: "text.secondary" }}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Collapse>
                    </>
                )}

                <ListItemButton
                    component={Link}
                    to="/games"
                    onClick={closeDrawer}
                    selected={isGamesActive}
                >
                    <ListItemText primary="Games" primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 600 }} />
                </ListItemButton>

                {[
                    { to: "/stats/jp", label: "Stats" },
                    { to: "/resources", label: "Resources" },
                ].map((item) => (
                    <ListItemButton
                        key={item.to}
                        component={Link}
                        to={item.to}
                        onClick={closeDrawer}
                        selected={isActive(item.to)}
                    >
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 600 }} />
                    </ListItemButton>
                ))}

                <Divider sx={{ my: 1 }} />

                {!loading && player?.admin && (
                    <ListItemButton component={Link} to="/admin" onClick={closeDrawer}>
                        <ListItemText
                            primary="Admin"
                            primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 700, color: "warning.main" }}
                        />
                    </ListItemButton>
                )}

                {loading ? (
                    <ListItemButton>
                        <Skeleton variant="text" width="100%" height={32} />
                    </ListItemButton>
                ) : player ? (
                    <>
                        <ListItem onClick={() => setUserOpen(!userOpen)} sx={{ cursor: "pointer", borderRadius: 2 }}>
                            <ListItemText primary={player.username} primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 700 }} />
                            <ExpandMore fontSize="small" sx={chevronSx(userOpen)} />
                        </ListItem>
                        <Collapse in={userOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 2 }}>
                                <ListItemButton component={Link} to="/settings" onClick={closeDrawer}>
                                    <ListItemText
                                        primary="Settings"
                                        primaryTypographyProps={{ fontSize: "0.875rem", color: "text.secondary" }}
                                    />
                                </ListItemButton>
                                <ListItemButton onClick={() => { logout(); closeDrawer(); }}>
                                    <ListItemText
                                        primary="Log Out"
                                        primaryTypographyProps={{ fontSize: "0.875rem", color: "error.main" }}
                                    />
                                </ListItemButton>
                            </List>
                        </Collapse>
                    </>
                ) : (
                    <ListItemButton component={Link} to="/login" onClick={closeDrawer} sx={drawerItemSx}>
                        <ListItemText
                            primary="Login"
                            primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 700, color: "primary.main" }}
                        />
                    </ListItemButton>
                )}
            </List>
        </Box>
    );

    // ─── Reusable desktop dropdown ──────────────────────────────────────────

    const DropMenu = ({
        anchor,
        onClose,
        items,
        origin = "left",
    }: {
        anchor: null | HTMLElement;
        onClose: () => void;
        items: { to: string; label: string }[];
        origin?: "left" | "right";
    }) => (
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={onClose} {...menuTransition(origin)}>
            {items.map((item) => (
                <MenuItem key={item.to} component={Link} to={item.to} onClick={onClose}>
                    {item.label}
                </MenuItem>
            ))}
        </Menu>
    );

    return (
        <AppBar
            position="sticky"
            color="primary"
            sx={{
                zIndex: (t) => t.zIndex.drawer + 1,
                transition: `box-shadow 0.3s ${EASE}, background-color 0.3s ${EASE}`,
                // Translucent black bar with white text.
                bgcolor: "rgba(0,0,0,0.65)",
                color: "#ffffff",
                borderBottom: (t) => `1px solid ${alpha(t.palette.primary.main, 0.25)}`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                "@supports not ((backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)))": {
                    bgcolor: "#0B0B0C",
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
                            "&:hover": { transform: "scale(1.15) rotate(6deg)" },
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
                            "&:hover": {
                                transform: "translateX(2px) scale(1.04)",
                                letterSpacing: "0.01em",
                            },
                        }}
                    >
                        UBC MJC
                    </Typography>
                </Box>

                {!isMobile && (
                    <>
                        <Stack direction="row" spacing={0.25} sx={{ flexGrow: 1 }}>
                            <Button
                                color="inherit"
                                sx={navBtnSx(isActive("/leaderboard"))}
                                onClick={(e) => setLeaderboardAnchor(e.currentTarget)}
                                endIcon={<KeyboardArrowDownIcon sx={chevronSx(Boolean(leaderboardAnchor))} />}
                            >
                                Leaderboard
                            </Button>
                            <DropMenu
                                anchor={leaderboardAnchor}
                                onClose={() => setLeaderboardAnchor(null)}
                                items={leaderboardItems}
                            />

                            <Button
                                color="inherit"
                                sx={navBtnSx(isGamesActive)}
                                component={Link}
                                to="/games"
                            >
                                Games
                            </Button>
                            <Button color="inherit" sx={navBtnSx(isActive("/stats"))} component={Link} to="/stats/jp">
                                Stats
                            </Button>
                            <Button color="inherit" sx={navBtnSx(isActive("/resources"))} component={Link} to="/resources">
                                Resources
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            {!loading && player?.admin && (
                                <Button
                                    color="inherit"
                                    sx={{ ...navBtnSx(isActive("/admin")), color: "warning.light", fontWeight: 700 }}
                                    component={Link}
                                    to="/admin"
                                >
                                    Admin
                                </Button>
                            )}
                            {!loading && player && (
                                <>
                                    <Button
                                        color="inherit"
                                        onClick={(e) => setRecordGameAnchor(e.currentTarget)}
                                        startIcon={
                                            <Box
                                                className="rec-dot"
                                                sx={{
                                                    width: 9,
                                                    height: 9,
                                                    borderRadius: "50%",
                                                    bgcolor: "primary.main",
                                                    flexShrink: 0,
                                                    opacity: 0,
                                                }}
                                            />
                                        }
                                        endIcon={<KeyboardArrowDownIcon sx={chevronSx(Boolean(recordGameAnchor))} />}
                                        sx={{
                                            ...interactiveSx,
                                            px: 1.75,
                                            py: 0.9,
                                            fontSize: "0.95rem",
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            border: "1px solid rgba(255,255,255,0.3)",
                                            "&:hover": {
                                                background: "rgba(255,255,255,0.18)",
                                                transform: HOVER_TRANSFORM,
                                                borderColor: "rgba(255,255,255,0.5)",
                                                "& .rec-dot": {
                                                    animation: `${pulse} 1.6s ease-in-out infinite`,
                                                },
                                            },
                                        }}
                                    >
                                        Record
                                    </Button>
                                    <DropMenu
                                        anchor={recordGameAnchor}
                                        onClose={() => setRecordGameAnchor(null)}
                                        items={recordGameItems}
                                        origin="right"
                                    />
                                </>
                            )}
                            {loading ? (
                                <Skeleton
                                    variant="rectangular"
                                    width={100}
                                    height={38}
                                    sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.12)" }}
                                />
                            ) : player ? (
                                <>
                                    <Button
                                        color="inherit"
                                        onClick={(e) => setUserAnchor(e.currentTarget)}
                                        endIcon={<KeyboardArrowDownIcon sx={chevronSx(Boolean(userAnchor))} />}
                                        sx={{
                                            ...interactiveSx,
                                            px: 1.75,
                                            py: 0.9,
                                            fontSize: "0.95rem",
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            border: "1px solid rgba(255,255,255,0.3)",
                                            "&:hover": {
                                                background: "rgba(255,255,255,0.18)",
                                                transform: HOVER_TRANSFORM,
                                                borderColor: "rgba(255,255,255,0.5)",
                                            },
                                        }}
                                    >
                                        {player.username}
                                    </Button>
                                    <Menu
                                        anchorEl={userAnchor}
                                        open={Boolean(userAnchor)}
                                        onClose={() => setUserAnchor(null)}
                                        {...menuTransition("right")}
                                    >
                                        <MenuItem component={Link} to="/settings" onClick={() => setUserAnchor(null)}>
                                            Settings
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => { logout(); setUserAnchor(null); }}
                                            sx={{ color: "error.main" }}
                                        >
                                            Log Out
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button
                                    variant="contained"
                                    component={Link}
                                    to="/login"
                                    sx={{
                                        ...interactiveSx,
                                        bgcolor: "rgba(255,255,255,0.2)",
                                        color: "white",
                                        fontWeight: 700,
                                        px: 2.5,
                                        py: 1,
                                        borderRadius: 2,
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        backdropFilter: "blur(4px)",
                                        "&:hover": {
                                            bgcolor: "rgba(255,255,255,0.32)",
                                            transform: HOVER_TRANSFORM,
                                            boxShadow: "none",
                                        },
                                    }}
                                >
                                    Log in
                                </Button>
                            )}
                        </Stack>
                    </>
                )}
            </Toolbar>

            <Drawer
                anchor="left"
                open={mobileDrawerOpen}
                onClose={handleDrawerToggle}
                transitionDuration={300}
            >
                {mobileDrawer}
            </Drawer>
        </AppBar>
    );
};

export default memo(NavBar);