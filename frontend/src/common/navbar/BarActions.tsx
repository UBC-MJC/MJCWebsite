import { Button, buttonClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router";
import { NavMenu, menuLink } from "./NavMenu";
import { gamePage, isItemActive, loginLink, newGameGroup } from "./navLinks";

const BarAction = styled(Button)(({ theme }) => ({
    flexShrink: 0,
    whiteSpace: "nowrap",
    padding: theme.spacing(0.75, 1.5),
    [theme.breakpoints.up("sm")]: { padding: theme.spacing(0.75, 2) },
    // Same 1px border as the outlined variant, so switching variants doesn't change the width
    [`&.${buttonClasses.contained}`]: { border: "1px solid transparent" },
})) as typeof Button;

export const NewGameMenu = ({ pathname }: { pathname: string }) => {
    const onTaskPage = isItemActive(pathname, newGameGroup) || gamePage.test(pathname);
    return (
        <NavMenu
            label={newGameGroup.label}
            Trigger={BarAction}
            triggerProps={{ variant: onTaskPage ? "outlined" : "contained", color: "primary" }}
        >
            {newGameGroup.links.map((link) => menuLink(link, pathname))}
        </NavMenu>
    );
};

export const LoginButton = () => (
    <BarAction variant="contained" component={Link} to={loginLink.to}>
        {loginLink.label}
    </BarAction>
);
