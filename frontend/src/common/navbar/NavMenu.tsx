import { useId, useState, type ComponentType, type ReactNode } from "react";
import { Button, Menu, MenuItem, type ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link } from "react-router";
import { isLinkActive, type NavLink } from "./navLinks";
import { leadingBar } from "./navStyles";

const NavMenuItem = styled(MenuItem)(({ theme }) => ({
    position: "relative",
    "&.Mui-selected::before": leadingBar(theme),
})) as typeof MenuItem;

interface NavMenuProps {
    label: ReactNode;
    Trigger?: ComponentType<ButtonProps>;
    triggerProps?: ButtonProps;
    align?: "left" | "right";
    children: ReactNode;
}

export const NavMenu = ({
    label,
    Trigger = Button,
    triggerProps,
    align = "left",
    children,
}: NavMenuProps) => {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const id = useId();
    const open = Boolean(anchor);
    const close = () => setAnchor(null);

    return (
        <>
            <Trigger
                color="inherit"
                {...triggerProps}
                id={`${id}-trigger`}
                aria-haspopup="true"
                aria-controls={open ? `${id}-menu` : undefined}
                aria-expanded={open ? "true" : undefined}
                endIcon={
                    <KeyboardArrowDownIcon
                        sx={{
                            transition: "transform 150ms ease-out",
                            transform: open ? "rotate(180deg)" : "none",
                        }}
                    />
                }
                onClick={(event) => setAnchor(event.currentTarget)}
            >
                {label}
            </Trigger>
            <Menu
                id={`${id}-menu`}
                anchorEl={anchor}
                open={open}
                onClose={close}
                anchorOrigin={{ vertical: "bottom", horizontal: align }}
                transformOrigin={{ vertical: "top", horizontal: align }}
                slotProps={{
                    paper: { sx: { minWidth: anchor?.offsetWidth } },
                    list: { "aria-labelledby": `${id}-trigger`, onClick: close },
                }}
            >
                {children}
            </Menu>
        </>
    );
};

// A function, not a component: MenuList focuses the child whose own props say `selected`
export const menuLink = (link: NavLink, pathname: string) => {
    const active = isLinkActive(pathname, link);
    return (
        <NavMenuItem
            key={link.to}
            component={Link}
            to={link.to}
            selected={active}
            aria-current={active ? "page" : undefined}
        >
            {link.label}
        </NavMenuItem>
    );
};
