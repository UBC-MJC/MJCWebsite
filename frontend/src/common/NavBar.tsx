import { useContext, memo, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Menu,
    MenuItem,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Box,
    useTheme,
    useMediaQuery,
    Divider,
    Collapse,
    Stack,
    Skeleton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { AuthContext } from "@/common/AuthContext";
import { Link } from "react-router-dom";
import { getGameVariantString } from "@/common/Utils";
import { navButton } from "@/theme/utils";

const NavBar = () => {
    const { player, loading, logout } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [leaderboardAnchor, setLeaderboardAnchor] = useState<null | HTMLElement>(null);
    const [recordGameAnchor, setRecordGameAnchor] = useState<null | HTMLElement>(null);
    const [liveGamesAnchor, setLiveGamesAnchor] = useState<null | HTMLElement>(null);
    const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // Mobile drawer states
    const [leaderboardOpen, setLeaderboardOpen] = useState(false);
    const [recordGameOpen, setRecordGameOpen] = useState(false);
    const [liveGamesOpen, setLiveGamesOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    const closeDrawer = () => {
        setMobileDrawerOpen(false);
    };

    const mobileDrawer = (
        <Box sx={{ width: 250 }} role="presentation">
            <List>
                <ListItem>
                    <Typography variant="h6">UBC Mahjong Club</Typography>
                </ListItem>
                <Divider />
                <ListItem onClick={() => setLeaderboardOpen(!leaderboardOpen)}>
                    <ListItemText primary="Leaderboard" />
                    {leaderboardOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={leaderboardOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem component={Link} to="/leaderboard/jp" onClick={closeDrawer}>
                            <ListItemText primary={getGameVariantString("jp", "RANKED")} />
                        </ListItem>
                        <ListItem
                            component={Link}
                            to="/leaderboard/jp/casual"
                            onClick={closeDrawer}
                        >
                            <ListItemText primary={getGameVariantString("jp", "CASUAL")} />
                        </ListItem>
                        <ListItem component={Link} to="/leaderboard/hk" onClick={closeDrawer}>
                            <ListItemText primary={getGameVariantString("hk", "RANKED")} />
                        </ListItem>
                        <ListItem
                            component={Link}
                            to="/leaderboard/hk/casual"
                            onClick={closeDrawer}
                        >
                            <ListItemText primary={getGameVariantString("hk", "CASUAL")} />
                        </ListItem>
                    </List>
                </Collapse>
                {!loading && player && (
                    <>
                        <ListItem onClick={() => setRecordGameOpen(!recordGameOpen)}>
                            <ListItemText primary="Record Game" />
                            {recordGameOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={recordGameOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {player.japaneseQualified && (
                                    <ListItem
                                        component={Link}
                                        to="/games/create/jp"
                                        onClick={closeDrawer}
                                    >
                                        <ListItemText
                                            primary={getGameVariantString("jp", "RANKED")}
                                        />
                                    </ListItem>
                                )}
                                <ListItem
                                    component={Link}
                                    to="/games/create/jp/casual"
                                    onClick={closeDrawer}
                                >
                                    <ListItemText primary={getGameVariantString("jp", "CASUAL")} />
                                </ListItem>
                                {player.hongKongQualified && (
                                    <ListItem
                                        component={Link}
                                        to="/games/create/hk"
                                        onClick={closeDrawer}
                                    >
                                        <ListItemText
                                            primary={getGameVariantString("hk", "RANKED")}
                                        />
                                    </ListItem>
                                )}
                                <ListItem
                                    component={Link}
                                    to="/games/create/hk/casual"
                                    onClick={closeDrawer}
                                >
                                    <ListItemText primary={getGameVariantString("hk", "CASUAL")} />
                                </ListItem>
                            </List>
                        </Collapse>
                    </>
                )}
                <ListItem onClick={() => setLiveGamesOpen(!liveGamesOpen)}>
                    <ListItemText primary="Live Games" />
                    {liveGamesOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={liveGamesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem component={Link} to="/games/current/jp" onClick={closeDrawer}>
                            <ListItemText primary={getGameVariantString("jp")} />
                        </ListItem>
                        <ListItem component={Link} to="/games/current/hk" onClick={closeDrawer}>
                            <ListItemText primary={getGameVariantString("hk")} />
                        </ListItem>
                    </List>
                </Collapse>
                <ListItem component={Link} to="/games" onClick={closeDrawer}>
                    <ListItemText primary="Logs" />
                </ListItem>
                <ListItem component={Link} to="/stats/jp" onClick={closeDrawer}>
                    <ListItemText primary="Stats" />
                </ListItem>
                <ListItem component={Link} to="/resources" onClick={closeDrawer}>
                    <ListItemText primary="Resources" />
                </ListItem>
                <Divider />
                {!loading && player && player.admin && (
                    <ListItem component={Link} to="/admin" onClick={closeDrawer}>
                        <ListItemText primary="Admin" />
                    </ListItem>
                )}
                {loading ? (
                    <ListItem>
                        <Skeleton variant="text" width="100%" height={32} />
                    </ListItem>
                ) : player ? (
                    <>
                        <ListItem onClick={() => setUserOpen(!userOpen)}>
                            <ListItemText primary={player.username} />
                            {userOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={userOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem component={Link} to="/settings" onClick={closeDrawer}>
                                    <ListItemText primary="Settings" />
                                </ListItem>
                                <ListItem
                                    onClick={() => {
                                        logout();
                                        closeDrawer();
                                    }}
                                >
                                    <ListItemText primary="Log Out" />
                                </ListItem>
                            </List>
                        </Collapse>
                    </>
                ) : (
                    <ListItem component={Link} to="/login" onClick={closeDrawer}>
                        <ListItemText primary="Login" />
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <AppBar position="static" color="info">
            <Toolbar>
                {isMobile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography variant="h6" component={Link} color="inherit" to="/">
                    UBC Mahjong Club
                </Typography>
                {!isMobile && (
                    <>
                        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                            <Button
                                color="inherit"
                                sx={navButton}
                                onClick={(e) => setLeaderboardAnchor(e.currentTarget)}
                                aria-label="Leaderboard menu"
                                aria-haspopup="true"
                                aria-expanded={Boolean(leaderboardAnchor)}
                                endIcon={<KeyboardArrowDownIcon />}
                            >
                                Leaderboard
                            </Button>
                            <Menu
                                anchorEl={leaderboardAnchor}
                                open={Boolean(leaderboardAnchor)}
                                onClose={() => setLeaderboardAnchor(null)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                transformOrigin={{ vertical: "top", horizontal: "left" }}
                            >
                                <MenuItem
                                    component={Link}
                                    to="/leaderboard/jp"
                                    onClick={() => setLeaderboardAnchor(null)}
                                >
                                    {getGameVariantString("jp", "RANKED")}
                                </MenuItem>
                                <MenuItem
                                    component={Link}
                                    to="/leaderboard/jp/casual"
                                    onClick={() => setLeaderboardAnchor(null)}
                                >
                                    {getGameVariantString("jp", "CASUAL")}
                                </MenuItem>
                                <MenuItem
                                    component={Link}
                                    to="/leaderboard/hk"
                                    onClick={() => setLeaderboardAnchor(null)}
                                >
                                    {getGameVariantString("hk", "RANKED")}
                                </MenuItem>
                                <MenuItem
                                    component={Link}
                                    to="/leaderboard/hk/casual"
                                    onClick={() => setLeaderboardAnchor(null)}
                                >
                                    {getGameVariantString("hk", "CASUAL")}
                                </MenuItem>
                            </Menu>
                            {!loading && player && (
                                <>
                                    <Button
                                        color="inherit"
                                        sx={navButton}
                                        onClick={(e) => setRecordGameAnchor(e.currentTarget)}
                                        aria-label="Record game menu"
                                        aria-haspopup="true"
                                        aria-expanded={Boolean(recordGameAnchor)}
                                        endIcon={<KeyboardArrowDownIcon />}
                                    >
                                        Record Game
                                    </Button>
                                    <Menu
                                        anchorEl={recordGameAnchor}
                                        open={Boolean(recordGameAnchor)}
                                        onClose={() => setRecordGameAnchor(null)}
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "left",
                                        }}
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "left",
                                        }}
                                    >
                                        {player.japaneseQualified && (
                                            <MenuItem
                                                component={Link}
                                                to="/games/create/jp"
                                                onClick={() => setRecordGameAnchor(null)}
                                            >
                                                {getGameVariantString("jp", "RANKED")}
                                            </MenuItem>
                                        )}
                                        <MenuItem
                                            component={Link}
                                            to="/games/create/jp/casual"
                                            onClick={() => setRecordGameAnchor(null)}
                                        >
                                            {getGameVariantString("jp", "CASUAL")}
                                        </MenuItem>
                                        {player.hongKongQualified && (
                                            <MenuItem
                                                component={Link}
                                                to="/games/create/hk"
                                                onClick={() => setRecordGameAnchor(null)}
                                            >
                                                {getGameVariantString("hk", "RANKED")}
                                            </MenuItem>
                                        )}
                                        <MenuItem
                                            component={Link}
                                            to="/games/create/hk/casual"
                                            onClick={() => setRecordGameAnchor(null)}
                                        >
                                            {getGameVariantString("hk", "CASUAL")}
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}
                            <Button
                                color="inherit"
                                sx={navButton}
                                onClick={(e) => setLiveGamesAnchor(e.currentTarget)}
                                aria-label="Live games menu"
                                aria-haspopup="true"
                                aria-expanded={Boolean(liveGamesAnchor)}
                                endIcon={<KeyboardArrowDownIcon />}
                            >
                                Live Games
                            </Button>
                            <Menu
                                anchorEl={liveGamesAnchor}
                                open={Boolean(liveGamesAnchor)}
                                onClose={() => setLiveGamesAnchor(null)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                transformOrigin={{ vertical: "top", horizontal: "left" }}
                            >
                                <MenuItem
                                    component={Link}
                                    to="/games/current/jp"
                                    onClick={() => setLiveGamesAnchor(null)}
                                >
                                    {getGameVariantString("jp")}
                                </MenuItem>
                                <MenuItem
                                    component={Link}
                                    to="/games/current/hk"
                                    onClick={() => setLiveGamesAnchor(null)}
                                >
                                    {getGameVariantString("hk")}
                                </MenuItem>
                            </Menu>
                            <Button color="inherit" sx={navButton} component={Link} to="/games">
                                Logs
                            </Button>
                            <Button color="inherit" sx={navButton} component={Link} to="/stats/jp">
                                Stats
                            </Button>
                            <Button color="inherit" sx={navButton} component={Link} to="/resources">
                                Resources
                            </Button>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                            divider={<Divider orientation="vertical" flexItem />}
                        >
                            {!loading && player && player.admin && (
                                <Button color="inherit" sx={navButton} component={Link} to="/admin">
                                    Admin
                                </Button>
                            )}
                            {loading ? (
                                <Skeleton
                                    variant="rectangular"
                                    width={100}
                                    height={36}
                                    sx={{
                                        borderRadius: 1,
                                        bgcolor: "rgba(255, 255, 255, 0.1)",
                                    }}
                                />
                            ) : player ? (
                                <>
                                    <Button
                                        color="inherit"
                                        sx={navButton}
                                        onClick={(e) => setUserAnchor(e.currentTarget)}
                                        aria-label="User menu"
                                        aria-haspopup="true"
                                        aria-expanded={Boolean(userAnchor)}
                                    >
                                        {player.username}
                                    </Button>
                                    <Menu
                                        anchorEl={userAnchor}
                                        open={Boolean(userAnchor)}
                                        onClose={() => setUserAnchor(null)}
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "right",
                                        }}
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                        }}
                                    >
                                        <MenuItem
                                            component={Link}
                                            to="/settings"
                                            onClick={() => setUserAnchor(null)}
                                        >
                                            Settings
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                logout();
                                                setUserAnchor(null);
                                            }}
                                        >
                                            Log Out
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button color="inherit" sx={navButton} component={Link} to="/login">
                                    Login
                                </Button>
                            )}
                        </Stack>
                    </>
                )}
            </Toolbar>
            <Drawer anchor="left" open={mobileDrawerOpen} onClose={handleDrawerToggle}>
                {mobileDrawer}
            </Drawer>
        </AppBar>
    );
};

export default memo(NavBar);
