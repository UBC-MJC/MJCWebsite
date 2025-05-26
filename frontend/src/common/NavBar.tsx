import React, { FC, useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
// import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "./AuthContext";
import { Link } from "react-router-dom";
import { getGameVariantString } from "./Utils";

const NavBar: FC = () => {
    const { player, logout } = useContext(AuthContext);

    // State for each dropdown menu
    const [anchorElLeaderboard, setAnchorElLeaderboard] = useState<null | HTMLElement>(null);
    const [anchorElRecord, setAnchorElRecord] = useState<null | HTMLElement>(null);
    const [anchorElLive, setAnchorElLive] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleMenuOpen =
        (setter: React.Dispatch<React.SetStateAction<HTMLElement | null>>) =>
        (event: React.MouseEvent<HTMLElement>) => {
            setter(event.currentTarget);
        };

    const handleMenuClose =
        (setter: React.Dispatch<React.SetStateAction<HTMLElement | null>>) => () => {
            setter(null);
        };

    return (
        <AppBar position="static" color="info">
            <Toolbar>
                <Typography variant="h6" component={Link} to="/">
                    UBC Mahjong Club
                </Typography>
                <Box>
                    {/* Leaderboard Dropdown */}
                    <Button color="inherit" onClick={handleMenuOpen(setAnchorElLeaderboard)}>
                        Leaderboard
                    </Button>
                    <Menu
                        anchorEl={anchorElLeaderboard}
                        open={Boolean(anchorElLeaderboard)}
                        onClose={handleMenuClose(setAnchorElLeaderboard)}
                    >
                        <MenuItem
                            component={Link}
                            to="/leaderboard/jp"
                            onClick={handleMenuClose(setAnchorElLeaderboard)}
                        >
                            {getGameVariantString("jp")}
                        </MenuItem>
                        <MenuItem
                            component={Link}
                            to="/leaderboard/jp/casual"
                            onClick={handleMenuClose(setAnchorElLeaderboard)}
                        >
                            {getGameVariantString("jp", "CASUAL")}
                        </MenuItem>
                        <MenuItem
                            component={Link}
                            to="/leaderboard/hk"
                            onClick={handleMenuClose(setAnchorElLeaderboard)}
                        >
                            {getGameVariantString("hk")}
                        </MenuItem>
                        <MenuItem
                            component={Link}
                            to="/leaderboard/hk/casual"
                            onClick={handleMenuClose(setAnchorElLeaderboard)}
                        >
                            {getGameVariantString("hk", "CASUAL")}
                        </MenuItem>
                    </Menu>

                    {/* Record Game Dropdown */}
                    {player && (
                        <>
                            <Button color="inherit" onClick={handleMenuOpen(setAnchorElRecord)}>
                                Record Game
                            </Button>
                            <Menu
                                anchorEl={anchorElRecord}
                                open={Boolean(anchorElRecord)}
                                onClose={handleMenuClose(setAnchorElRecord)}
                            >
                                {player.japaneseQualified && (
                                    <MenuItem
                                        component={Link}
                                        to="/games/create/jp"
                                        onClick={handleMenuClose(setAnchorElRecord)}
                                    >
                                        {getGameVariantString("jp")}
                                    </MenuItem>
                                )}
                                <MenuItem
                                    component={Link}
                                    to="/games/create/jp/casual"
                                    onClick={handleMenuClose(setAnchorElRecord)}
                                >
                                    {getGameVariantString("jp", "CASUAL")}
                                </MenuItem>
                                {player.hongKongQualified && (
                                    <MenuItem
                                        component={Link}
                                        to="/games/create/hk"
                                        onClick={handleMenuClose(setAnchorElRecord)}
                                    >
                                        {getGameVariantString("hk")}
                                    </MenuItem>
                                )}
                                <MenuItem
                                    component={Link}
                                    to="/games/create/hk/casual"
                                    onClick={handleMenuClose(setAnchorElRecord)}
                                >
                                    {getGameVariantString("hk", "CASUAL")}
                                </MenuItem>
                            </Menu>
                        </>
                    )}

                    {/* Live Games Dropdown */}
                    <Button color="inherit" onClick={handleMenuOpen(setAnchorElLive)}>
                        Live Games
                    </Button>
                    <Menu
                        anchorEl={anchorElLive}
                        open={Boolean(anchorElLive)}
                        onClose={handleMenuClose(setAnchorElLive)}
                    >
                        <MenuItem
                            component={Link}
                            to="/games/current/jp"
                            onClick={handleMenuClose(setAnchorElLive)}
                        >
                            {getGameVariantString("jp", "")}
                        </MenuItem>
                        <MenuItem
                            component={Link}
                            to="/games/current/hk"
                            onClick={handleMenuClose(setAnchorElLive)}
                        >
                            {getGameVariantString("hk", "")}
                        </MenuItem>
                    </Menu>

                    <Button color="inherit" component={Link} to="/games">
                        Logs
                    </Button>
                    <Button color="inherit" component={Link} to="/stats/jp">
                        Stats
                    </Button>
                    <Button color="inherit" component={Link} to="/resources">
                        Resources
                    </Button>
                    {player && player.admin && (
                        <Button color="inherit" component={Link} to="/admin">
                            Admin
                        </Button>
                    )}
                    {player ? (
                        <>
                            <Button color="inherit" onClick={handleMenuOpen(setAnchorElUser)}>
                                {player.username}
                            </Button>
                            <Menu
                                anchorEl={anchorElUser}
                                open={Boolean(anchorElUser)}
                                onClose={handleMenuClose(setAnchorElUser)}
                            >
                                <MenuItem
                                    component={Link}
                                    to="/settings"
                                    onClick={handleMenuClose(setAnchorElUser)}
                                >
                                    Settings
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        logout();
                                        setAnchorElUser(null);
                                    }}
                                >
                                    Log Out
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                    )}
                </Box>
                {/* Mobile menu icon (optional, not implemented here) */}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
