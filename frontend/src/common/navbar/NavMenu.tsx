import { useId, useState, type ReactNode } from "react";
import { Button, Menu, MenuItem, type ButtonProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link } from "react-router";
import { isItemActive, isLinkActive, newGameGroup, type NavLink } from "./navLinks";

const chevronSx = (open: boolean): SxProps<Theme> => ({
    transition: "transform 150ms ease-out",
    transform: open ? "rotate(180deg)" : "none",
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

interface NavMenuProps {
    label: ReactNode;
    triggerProps: ButtonProps;
    align?: "left" | "right";
    children: ReactNode;
}

export const NavMenu = ({ label, triggerProps, align = "left", children }: NavMenuProps) => {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const id = useId();
    const open = Boolean(anchor);
    const close = () => setAnchor(null);

    return (
        <>
            <Button
                color="inherit"
                {...triggerProps}
                id={`${id}-trigger`}
                aria-haspopup="true"
                aria-controls={open ? `${id}-menu` : undefined}
                aria-expanded={open ? "true" : undefined}
                endIcon={<KeyboardArrowDownIcon sx={chevronSx(open)} />}
                onClick={(event) => setAnchor(event.currentTarget)}
            >
                {label}
            </Button>
            <Menu
                id={`${id}-menu`}
                anchorEl={anchor}
                open={open}
                onClose={close}
                anchorOrigin={{ vertical: "bottom", horizontal: align }}
                transformOrigin={{ vertical: "top", horizontal: align }}
                // Any item click closes the menu, so each item doesn't need its own handler
                slotProps={{ list: { "aria-labelledby": `${id}-trigger`, onClick: close } }}
            >
                {children}
            </Menu>
        </>
    );
};

// A function rather than a component, so MenuList sees `selected` on its direct children and focuses that item
export const menuLink = (link: NavLink, pathname: string) => {
    const active = isLinkActive(pathname, link);
    return (
        <MenuItem
            key={link.to}
            component={Link}
            to={link.to}
            selected={active}
            aria-current={active ? "page" : undefined}
        >
            {link.label}
        </MenuItem>
    );
};

// The bar's one filled action, at every width. On a create page it turns outlined so it doesn't compete with the
// page's own Create Game button; the transparent border keeps both variants the same width.
// minHeight is restated because passing `sx` replaces the theme's default Button `sx`
export const NewGameMenu = ({ pathname }: { pathname: string }) => {
    const current = isItemActive(pathname, newGameGroup);
    return (
        <NavMenu
            label={newGameGroup.label}
            triggerProps={{
                variant: current ? "outlined" : "contained",
                color: "primary",
                sx: {
                    minHeight: 44,
                    px: { xs: 1.5, sm: 2 },
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    ...(!current && { border: "1px solid transparent" }),
                },
            }}
        >
            {newGameGroup.links.map((link) => menuLink(link, pathname))}
        </NavMenu>
    );
};
