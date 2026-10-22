import { Button } from "@mui/material";
import { Link } from "react-router";
import { NavMenu, menuLink } from "./NavMenu";
import { gamePage, isItemActive, loginLink, newGameGroup } from "./navLinks";

// The bar's one filled action, at the right at every width: New game when signed in, Log in when not.
// minHeight is restated because passing `sx` replaces the theme's default Button `sx`
const actionSx = { minHeight: 44, px: { xs: 1.5, sm: 2 }, flexShrink: 0, whiteSpace: "nowrap" };

// On a create page or a game page New game turns outlined, so the page's own task stays the strongest control.
// The transparent border keeps both variants the same width
export const NewGameMenu = ({ pathname }: { pathname: string }) => {
    const current = isItemActive(pathname, newGameGroup) || gamePage.test(pathname);
    return (
        <NavMenu
            label={newGameGroup.label}
            triggerProps={{
                variant: current ? "outlined" : "contained",
                color: "primary",
                sx: { ...actionSx, ...(!current && { border: "1px solid transparent" }) },
            }}
        >
            {newGameGroup.links.map((link) => menuLink(link, pathname))}
        </NavMenu>
    );
};

export const LoginButton = () => (
    <Button variant="contained" component={Link} to={loginLink.to} sx={actionSx}>
        {loginLink.label}
    </Button>
);
