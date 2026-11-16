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
    Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router";
import { truncate } from "@/theme/utils";
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

const DrawerItem = styled(ListItemButton)(({ theme }) => ({
    "&.Mui-selected::before": leadingBar(theme),
})) as typeof ListItemButton;

const GroupLabel = styled(ListSubheader)(({ theme }) => ({
    ...truncate,
    position: "relative",
    backgroundColor: "transparent",
    "&[data-current]": { color: theme.palette.text.primary, "&::before": leadingBar(theme) },
})) as typeof ListSubheader;

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
            <DrawerItem
                component={Link}
                to={link.to}
                selected={active}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
                sx={{ pl: inset ? 4 : 2 }}
            >
                <ListItemText primary={link.label} />
            </DrawerItem>
        </ListItem>
    );
};

interface DrawerGroupProps {
    label: ReactNode;
    current?: boolean;
    children: ReactNode;
}

// The label sits outside the list so screen readers don't count it as one of the items
const DrawerGroup = ({ label, current = false, children }: DrawerGroupProps) => {
    const id = useId();
    return (
        <Box role="group" aria-labelledby={id}>
            <GroupLabel component="div" id={id} disableSticky data-current={current || undefined}>
                {label}
            </GroupLabel>
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
        <Box sx={{ width: 280 }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ pl: 2 }}
            >
                <Wordmark onClick={onClose} />
                <IconButton color="inherit" aria-label="Close menu" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Stack>
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
            <Divider />
            {loading ? (
                <Box sx={{ px: 2, py: 1 }}>
                    <Skeleton variant="rounded" height={40} />
                </Box>
            ) : player ? (
                <DrawerGroup label={player.username}>
                    {groupLinks(player.admin ? [settingsLink, adminLink] : [settingsLink])}
                    <ListItem disablePadding>
                        <DrawerItem
                            onClick={() => {
                                onLogout();
                                onClose();
                            }}
                            sx={{ pl: 4 }}
                        >
                            <ListItemText primary="Log out" />
                        </DrawerItem>
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
