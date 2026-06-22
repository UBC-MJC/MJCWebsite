import { useContext, memo, useState, type ReactNode } from "react";
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
    ListItemIcon,
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
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import CasinoRoundedIcon from "@mui/icons-material/CasinoRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { AuthContext } from "@/common/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { getGameVariantString } from "@/common/Utils";
import { palette, shadow, timing } from "@/theme/tokens";
import { gradientTitle } from "@/theme/utils";

// ─── Animations ────────────────────────────────────────────────────────────

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

// ─── Mobile drawer building blocks ───────────────────────────────────────────

/**
 * Row styling shared by every drawer destination. Active rows read with the
 * pastel-red accent on three channels at once — tinted fill, a left accent bar,
 * and bolder weight — so the current location is never signalled by color alone.
 */
const drawerItemSx = (active: boolean, danger = false): SxProps<Theme> => ({
    position: "relative",
    minHeight: 48,
    borderRadius: 2,
    pl: 2,
    pr: 1.25,
    my: 0.25,
    color: danger ? "error.main" : active ? "primary.light" : "text.primary",
    ...(active && { bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.12) }),
    "& .MuiListItemIcon-root": { color: "inherit", minWidth: 40 },
    "& .MuiListItemText-primary": { fontSize: "0.95rem", fontWeight: active ? 700 : 500 },
    "&::before": {
        content: '""',
        position: "absolute",
        left: 4,
        top: "50%",
        height: 22,
        width: 3,
        borderRadius: 3,
        bgcolor: "primary.main",
        transform: `translateY(-50%) scaleX(${active ? 1 : 0})`,
        transformOrigin: "left center",
        transition: `transform ${timing.normal} ${EASE}`,
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    },
});

/** Indented, lighter styling for nested rows (the Leaderboard sub-links). */
const drawerSubItemSx = (active: boolean): SxProps<Theme> => ({
    minHeight: 42,
    borderRadius: 2,
    pl: 4.5,
    pr: 1.25,
    my: 0.25,
    color: active ? "primary.light" : "text.secondary",
    ...(active && { bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.1) }),
    "& .MuiListItemText-primary": { fontSize: "0.875rem", fontWeight: active ? 700 : 500 },
});

const DrawerSectionLabel = ({ children }: { children: ReactNode }) => (
    <Typography
        component="div"
        sx={{
            px: 2.5,
            pt: 2,
            pb: 0.75,
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.disabled",
        }}
    >
        {children}
    </Typography>
);

interface DrawerItemProps {
    label: string;
    icon: ReactNode;
    to?: string;
    onClick?: () => void;
    active?: boolean;
    danger?: boolean;
}

/** A single drawer destination: icon + label, with optional Link routing. */
const DrawerItem = ({ label, icon, to, onClick, active = false, danger = false }: DrawerItemProps) => {
    const sx = drawerItemSx(active, danger);
    const body = (
        <>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
        </>
    );
    return to ? (
        <ListItemButton
            component={Link}
            to={to}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            sx={sx}
        >
            {body}
        </ListItemButton>
    ) : (
        <ListItemButton onClick={onClick} sx={sx}>
            {body}
        </ListItemButton>
    );
};

const DrawerSubItem = ({
    label,
    to,
    active = false,
    onClick,
}: {
    label: string;
    to: string;
    active?: boolean;
    onClick?: () => void;
}) => (
    <ListItemButton
        component={Link}
        to={to}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        sx={drawerSubItemSx(active)}
    >
        <Box
            component="span"
            sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: "currentColor",
                opacity: 0.7,
                mr: 1.75,
                flexShrink: 0,
            }}
        />
        <ListItemText primary={label} />
    </ListItemButton>
);

// ─── Component ─────────────────────────────────────────────────────────────────

const NavBar = () => {
    const { player, loading, logout } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const location = useLocation();

    const [leaderboardAnchor, setLeaderboardAnchor] = useState<null | HTMLElement>(null);
    const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const [leaderboardOpen, setLeaderboardOpen] = useState(false);

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

    // ─── Mobile drawer ──────────────────────────────────────────────────────

    const mobileDrawer = (
        <Box
            role="presentation"
            sx={{
                width: "min(86vw, 320px)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
            }}
        >
            {/* Brand header — mirrors the top bar's gradient wordmark on a dark
                surface, with the close affordance kept clear of the notch. */}
            <Box
                sx={{
                    pt: "calc(env(safe-area-inset-top) + 14px)",
                    px: 2,
                    pb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
            >
                <Box
                    component={Link}
                    to="/"
                    onClick={closeDrawer}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                        minWidth: 0,
                    }}
                >
                    <LogoIcon />
                    <Typography variant="h6" sx={{ ...gradientTitle, fontSize: "1.2rem" }}>
                        UBC MJC
                    </Typography>
                </Box>
                <IconButton
                    onClick={closeDrawer}
                    aria-label="Close menu"
                    sx={{ color: "text.secondary", flexShrink: 0 }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Scrollable destinations; bottom inset keeps the last row clear of
                the home indicator on gesture-nav phones. */}
            <Box
                component="nav"
                aria-label="Main navigation"
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 0.5,
                    pb: "calc(env(safe-area-inset-bottom) + 16px)",
                }}
            >
                <DrawerSectionLabel>Menu</DrawerSectionLabel>
                <List disablePadding>
                    <DrawerItem
                        to="/"
                        label="Home"
                        icon={<HomeRoundedIcon />}
                        active={location.pathname === "/"}
                        onClick={closeDrawer}
                    />

                    <ListItemButton
                        onClick={() => setLeaderboardOpen((prev) => !prev)}
                        aria-expanded={leaderboardOpen}
                        sx={drawerItemSx(isActive("/leaderboard"))}
                    >
                        <ListItemIcon>
                            <EmojiEventsRoundedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Leaderboard" />
                        <ExpandMore fontSize="small" sx={chevronSx(leaderboardOpen)} />
                    </ListItemButton>
                    <Collapse in={leaderboardOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {leaderboardItems.map((item) => (
                                <DrawerSubItem
                                    key={item.to}
                                    to={item.to}
                                    label={item.label}
                                    active={location.pathname === item.to}
                                    onClick={closeDrawer}
                                />
                            ))}
                        </List>
                    </Collapse>

                    {!loading && player && (
                        <DrawerItem
                            to="/games/create"
                            label="Record Game"
                            icon={<AddCircleRoundedIcon />}
                            active={location.pathname.startsWith("/games/create")}
                            onClick={closeDrawer}
                        />
                    )}
                    <DrawerItem
                        to="/games"
                        label="Games"
                        icon={<CasinoRoundedIcon />}
                        active={isGamesActive}
                        onClick={closeDrawer}
                    />
                    <DrawerItem
                        to="/stats/jp"
                        label="Stats"
                        icon={<InsightsRoundedIcon />}
                        active={isActive("/stats")}
                        onClick={closeDrawer}
                    />
                    <DrawerItem
                        to="/resources"
                        label="Resources"
                        icon={<MenuBookRoundedIcon />}
                        active={isActive("/resources")}
                        onClick={closeDrawer}
                    />
                </List>

                <Divider sx={{ my: 1, mx: 2 }} />
                <DrawerSectionLabel>Account</DrawerSectionLabel>

                {loading ? (
                    <Box sx={{ px: 2, py: 1 }}>
                        <Skeleton variant="rounded" height={44} />
                    </Box>
                ) : player ? (
                    <List disablePadding>
                        <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Box
                                aria-hidden
                                sx={{
                                    width: 38,
                                    height: 38,
                                    flexShrink: 0,
                                    borderRadius: "50%",
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: 800,
                                    fontSize: "1rem",
                                    color: "primary.light",
                                    bgcolor: (t) => alpha(t.palette.primary.main, 0.16),
                                }}
                            >
                                {player.username.charAt(0).toUpperCase()}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                                    {player.username}
                                </Typography>
                                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                                    {player.admin ? "Administrator" : "Member"}
                                </Typography>
                            </Box>
                        </Box>

                        {player.admin && (
                            <DrawerItem
                                to="/admin"
                                label="Admin"
                                icon={<AdminPanelSettingsRoundedIcon />}
                                active={isActive("/admin")}
                                onClick={closeDrawer}
                            />
                        )}
                        <DrawerItem
                            to="/settings"
                            label="Settings"
                            icon={<SettingsRoundedIcon />}
                            active={isActive("/settings")}
                            onClick={closeDrawer}
                        />
                        <Divider sx={{ my: 0.5, mx: 2 }} />
                        <DrawerItem
                            label="Log Out"
                            icon={<LogoutRoundedIcon />}
                            danger
                            onClick={() => {
                                logout();
                                closeDrawer();
                            }}
                        />
                    </List>
                ) : (
                    <List disablePadding>
                        <DrawerItem
                            to="/login"
                            label="Log In"
                            icon={<LoginRoundedIcon />}
                            active={isActive("/login")}
                            onClick={closeDrawer}
                        />
                    </List>
                )}
            </Box>
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
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/games/create"
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