import { useState } from "react";
import { Box, Button, Menu, MenuItem, Stack, Skeleton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link } from "react-router-dom";
import type { Player } from "@/types";
import { pulse } from "@/theme/animations";
import {
    navBtnSx,
    frostedButtonBase,
    frostedButtonHover,
    interactiveSx,
    chevronSx,
    menuTransition,
    HOVER_TRANSFORM,
} from "./navStyles";
import { isPathActive, isGamesActive } from "./navActive";

interface DesktopNavProps {
    player: Player | undefined;
    loading: boolean;
    pathname: string;
    onLogout: () => void;
}

const DesktopNav = ({ player, loading, pathname, onLogout }: DesktopNavProps) => {
    const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

    return (
        <>
            <Stack direction="row" spacing={0.25} sx={{ flexGrow: 1 }}>
                <Button
                    color="inherit"
                    sx={navBtnSx(isPathActive(pathname, "/leaderboard"))}
                    component={Link}
                    to="/leaderboard"
                >
                    Leaderboard
                </Button>

                <Button
                    color="inherit"
                    sx={navBtnSx(isGamesActive(pathname))}
                    component={Link}
                    to="/games"
                >
                    Games
                </Button>
                <Button
                    color="inherit"
                    sx={navBtnSx(isPathActive(pathname, "/stats"))}
                    component={Link}
                    to="/stats/jp"
                >
                    Stats
                </Button>
                <Button
                    color="inherit"
                    sx={navBtnSx(isPathActive(pathname, "/resources"))}
                    component={Link}
                    to="/resources"
                >
                    Resources
                </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
                {!loading && player?.admin && (
                    <Button
                        color="inherit"
                        sx={{
                            ...navBtnSx(isPathActive(pathname, "/admin")),
                            color: "warning.light",
                            fontWeight: 700,
                        }}
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
                            ...frostedButtonBase,
                            "@media (hover: hover)": {
                                "&:hover": {
                                    ...frostedButtonHover,
                                    "& .rec-dot": {
                                        animation: `${pulse} 1.6s ease-in-out infinite`,
                                        "@media (prefers-reduced-motion: reduce)": {
                                            animation: "none",
                                        },
                                    },
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
                        sx={{ borderRadius: 2, bgcolor: "var(--mui-palette-glass-skeleton)" }}
                    />
                ) : player ? (
                    <>
                        <Button
                            color="inherit"
                            onClick={(e) => setUserAnchor(e.currentTarget)}
                            endIcon={<KeyboardArrowDownIcon sx={chevronSx(Boolean(userAnchor))} />}
                            sx={{
                                ...frostedButtonBase,
                                "@media (hover: hover)": {
                                    "&:hover": frostedButtonHover,
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
                                onClick={() => {
                                    onLogout();
                                    setUserAnchor(null);
                                }}
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
                            bgcolor: "var(--mui-palette-glass-cta)",
                            color: "text.primary",
                            fontWeight: 700,
                            px: 2.5,
                            py: 1,
                            borderRadius: 2,
                            border: `1px solid var(--mui-palette-glass-border)`,
                            backdropFilter: "blur(4px)",
                            "@media (hover: hover)": {
                                "&:hover": {
                                    bgcolor: "var(--mui-palette-glass-fillStrong)",
                                    transform: HOVER_TRANSFORM,
                                    boxShadow: "none",
                                },
                            },
                        }}
                    >
                        Log in
                    </Button>
                )}
            </Stack>
        </>
    );
};

export default DesktopNav;
