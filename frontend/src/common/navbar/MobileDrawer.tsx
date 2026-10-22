import { useId, type ReactNode } from "react";
import {
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Skeleton,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router";
import type { Player } from "@/types";
import Wordmark from "./Wordmark";
import { leadingBar } from "./navStyles";
import {
    adminLink,
    isLinkActive,
    isNavGroup,
    loginLink,
    mainNav,
    settingsLink,
    type NavLink,
} from "./navLinks";

// Every destination is one tap: groups are labelled and always open, not accordions. New game isn't here: it stays
// in the bar at every width. The leading bar marks the current page's row, or a group's label for a page of the
// group that has no row (a game page, under Games)

const drawerItemSx = (inset: boolean): SxProps<Theme> => ({
    position: "relative",
    minHeight: 44,
    py: 0.5, // MUI's default padding would make each row 48px and push Log out below the fold on phones
    pl: inset ? 4 : 2,
    "&.Mui-selected::before": leadingBar,
});

const subheaderSx = (current: boolean): SxProps<Theme> => ({
    position: "relative",
    lineHeight: "32px",
    mt: 1,
    fontWeight: 600, // so each group's "Riichi" and "Hong Kong" rows read as belonging to it
    bgcolor: "transparent",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    ...(current && { color: "text.primary", "&::before": leadingBar }),
});

interface DrawerLinkProps {
    link: NavLink;
    pathname: string;
    inset?: boolean;
    onClose: () => void;
}

const DrawerLink = ({ link, pathname, inset = false, onClose }: DrawerLinkProps) => {
    const active = isLinkActive(pathname, link);
    return (
        <ListItem disablePadding>
            <ListItemButton
                component={Link}
                to={link.to}
                selected={active}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
                sx={drawerItemSx(inset)}
            >
                <ListItemText primary={link.label} />
            </ListItemButton>
        </ListItem>
    );
};

interface DrawerGroupProps {
    label: ReactNode;
    current?: boolean;
    children: ReactNode;
}

// The label sits outside the list so screen readers don't count it as one of the group's items
const DrawerGroup = ({ label, current = false, children }: DrawerGroupProps) => {
    const id = useId();
    return (
        <Box role="group" aria-labelledby={id}>
            <ListSubheader component="div" id={id} disableSticky sx={subheaderSx(current)}>
                {label}
            </ListSubheader>
            <List disablePadding>{children}</List>
        </Box>
    );
};

interface MobileDrawerProps {
    player: Player | undefined;
    loading: boolean;
    pathname: string;
    onClose: () => void;
    onLogout: () => void;
}

const MobileDrawer = ({ player, loading, pathname, onClose, onLogout }: MobileDrawerProps) => {
    const groupLinks = (links: NavLink[]) =>
        links.map((link) => (
            <DrawerLink key={link.to} link={link} pathname={pathname} inset onClose={onClose} />
        ));

    return (
        <Box sx={{ width: 280, maxWidth: "85vw", pb: "calc(env(safe-area-inset-bottom) + 8px)" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    minHeight: 56,
                    pt: "env(safe-area-inset-top)",
                    pl: 2,
                    pr: 0.5,
                }}
            >
                <Wordmark onClick={onClose} />
                <IconButton color="inherit" aria-label="Close menu" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <Box component="nav" aria-label="Main">
                {mainNav.map((item) =>
                    isNavGroup(item) ? (
                        <DrawerGroup
                            key={item.label}
                            label={item.label}
                            current={item.match?.test(pathname)}
                        >
                            {groupLinks(item.links)}
                        </DrawerGroup>
                    ) : (
                        <List key={item.label} disablePadding>
                            <DrawerLink link={item} pathname={pathname} onClose={onClose} />
                        </List>
                    ),
                )}
            </Box>
            <Divider sx={{ my: 1 }} />
            {loading ? (
                <Box sx={{ px: 2, py: 1 }}>
                    <Skeleton variant="rounded" height={40} />
                </Box>
            ) : player ? (
                <DrawerGroup label={player.username}>
                    {groupLinks(player.admin ? [settingsLink, adminLink] : [settingsLink])}
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                onLogout();
                                onClose();
                            }}
                            sx={drawerItemSx(true)}
                        >
                            <ListItemText primary="Log out" />
                        </ListItemButton>
                    </ListItem>
                </DrawerGroup>
            ) : (
                <List disablePadding>
                    <DrawerLink link={loginLink} pathname={pathname} onClose={onClose} />
                </List>
            )}
        </Box>
    );
};

export default MobileDrawer;
