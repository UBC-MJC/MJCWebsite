import { type ReactNode } from "react";
import {
    Box,
    Typography,
    IconButton,
    List,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Skeleton,
    alpha,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
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
import type { Player } from "@/types";
import { gradientTitle, eyebrowLabel } from "@/theme/utils";
import LogoIcon from "./LogoIcon";
import { drawerItemSx } from "./navStyles";
import { isPathActive, isGamesActive } from "./navActive";

const DrawerSectionLabel = ({ children }: { children: ReactNode }) => (
    <Typography
        component="div"
        sx={{ ...eyebrowLabel, px: 2.5, pt: 2, pb: 0.75, fontSize: "0.7rem", color: "text.disabled" }}
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
    const sx = drawerItemSx(active, danger) as SxProps<Theme>;
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

interface MobileDrawerProps {
    player: Player | undefined;
    loading: boolean;
    pathname: string;
    onClose: () => void;
    onLogout: () => void;
}

const MobileDrawer = ({ player, loading, pathname, onClose, onLogout }: MobileDrawerProps) => (
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
                onClick={onClose}
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
                onClick={onClose}
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
                    active={pathname === "/"}
                    onClick={onClose}
                />

                <DrawerItem
                    to="/leaderboard"
                    label="Leaderboard"
                    icon={<EmojiEventsRoundedIcon />}
                    active={isPathActive(pathname, "/leaderboard")}
                    onClick={onClose}
                />

                {!loading && player && (
                    <DrawerItem
                        to="/games/create"
                        label="Record Game"
                        icon={<AddCircleRoundedIcon />}
                        active={pathname.startsWith("/games/create")}
                        onClick={onClose}
                    />
                )}
                <DrawerItem
                    to="/games"
                    label="Games"
                    icon={<CasinoRoundedIcon />}
                    active={isGamesActive(pathname)}
                    onClick={onClose}
                />
                <DrawerItem
                    to="/stats/jp"
                    label="Stats"
                    icon={<InsightsRoundedIcon />}
                    active={isPathActive(pathname, "/stats")}
                    onClick={onClose}
                />
                <DrawerItem
                    to="/resources"
                    label="Resources"
                    icon={<MenuBookRoundedIcon />}
                    active={isPathActive(pathname, "/resources")}
                    onClick={onClose}
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
                            active={isPathActive(pathname, "/admin")}
                            onClick={onClose}
                        />
                    )}
                    <DrawerItem
                        to="/settings"
                        label="Settings"
                        icon={<SettingsRoundedIcon />}
                        active={isPathActive(pathname, "/settings")}
                        onClick={onClose}
                    />
                    <Divider sx={{ my: 0.5, mx: 2 }} />
                    <DrawerItem
                        label="Log Out"
                        icon={<LogoutRoundedIcon />}
                        danger
                        onClick={() => {
                            onLogout();
                            onClose();
                        }}
                    />
                </List>
            ) : (
                <List disablePadding>
                    <DrawerItem
                        to="/login"
                        label="Log In"
                        icon={<LoginRoundedIcon />}
                        active={isPathActive(pathname, "/login")}
                        onClick={onClose}
                    />
                </List>
            )}
        </Box>
    </Box>
);

export default MobileDrawer;
