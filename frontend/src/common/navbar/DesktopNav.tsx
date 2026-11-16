import { Box, Button, Divider, MenuItem, Skeleton, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router";
import { truncate } from "@/theme/utils";
import type { Player } from "@/types";
import { LoginButton, NewGameMenu } from "./BarActions";
import { NavMenu, menuLink } from "./NavMenu";
import {
    DESKTOP,
    adminLink,
    isItemActive,
    isLinkActive,
    isNavGroup,
    mainNav,
    settingsLink,
} from "./navLinks";

const NavTab = styled(Button)(({ theme }) => ({
    padding: theme.spacing(0.75, 1.5),
    color: theme.palette.text.secondary,
    "&[aria-current], &[aria-expanded=true]": { color: theme.palette.text.primary },
    "&[aria-current]": { borderBottom: "2px solid" },
    "&.Mui-focusVisible": { outlineOffset: -2 },
})) as typeof Button;

interface DesktopNavProps {
    player: Player | undefined;
    loading: boolean;
    pathname: string;
    onLogout: () => void;
}

const DesktopNav = ({ player, loading, pathname, onLogout }: DesktopNavProps) => {
    const accountActive = [settingsLink, adminLink].some((link) => isLinkActive(pathname, link));

    return (
        <Box
            sx={{
                display: { xs: "none", [DESKTOP]: "flex" },
                alignSelf: "stretch",
                flexGrow: 1,
                ml: 1,
            }}
        >
            <Box component="nav" aria-label="Main" sx={{ display: "flex" }}>
                {mainNav.map((item) => {
                    const active = isItemActive(pathname, item);
                    return isNavGroup(item) ? (
                        <NavMenu
                            key={item.label}
                            label={item.label}
                            Trigger={NavTab}
                            // "true", not "page": a menu trigger marks a section, not a page
                            triggerProps={{ "aria-current": active ? "true" : undefined }}
                        >
                            {item.links.map((link) => menuLink(link, pathname))}
                        </NavMenu>
                    ) : (
                        <NavTab
                            key={item.label}
                            color="inherit"
                            component={Link}
                            to={item.to}
                            aria-current={active ? "page" : undefined}
                        >
                            {item.label}
                        </NavTab>
                    );
                })}
            </Box>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                useFlexGap
                sx={{ ml: "auto", pl: 2, minWidth: 0 }}
            >
                {loading ? (
                    <Skeleton variant="rounded" width={200} height={44} />
                ) : player ? (
                    <>
                        <NewGameMenu pathname={pathname} />
                        <NavMenu
                            label={
                                <Box
                                    component="span"
                                    sx={{ ...truncate, display: "block", maxWidth: 160 }}
                                >
                                    {player.username}
                                </Box>
                            }
                            align="right"
                            Trigger={NavTab}
                            triggerProps={{
                                "aria-current": accountActive ? "true" : undefined,
                                "aria-label": `Account: ${player.username}`,
                            }}
                        >
                            {menuLink(settingsLink, pathname)}
                            {player.admin && menuLink(adminLink, pathname)}
                            <Divider />
                            <MenuItem onClick={onLogout}>Log out</MenuItem>
                        </NavMenu>
                    </>
                ) : (
                    <LoginButton />
                )}
            </Stack>
        </Box>
    );
};

export default DesktopNav;
