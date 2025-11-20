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
    Avatar,
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
    const { player, logout } = useContext(AuthContext);
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
                        <ListItem
                            component={Link}
                            to="/leaderboard/jp"
                            sx={{ pl: 4 }}
                            onClick={closeDrawer}
                        >
                            <ListItemText primary={getGameVariantString("jp", "RANKED")} />
                        </ListItem>
                        <ListItem
                            component={Link}
                            to="/leaderboard/jp/casual"
                            sx={{ pl: 4 }}
                            onClick={closeDrawer}
                        >
                            <ListItemText primary={getGameVariantString("jp", "CASUAL")} />
                        </ListItem>
                        <ListItem
                            component={Link}
                            to="/leaderboard/hk"
                            sx={{ pl: 4 }}
                            onClick={closeDrawer}
                        >
                            <ListItemText primary={getGameVariantString("hk", "RANKED")} />
                        </ListItem>
                        <ListItem
                            component={Link}
                            to="/leaderboard/hk/casual"
                            sx={{ pl: 4 }}
                            onClick={closeDrawer}
                        >
                            <ListItemText primary={getGameVariantString("hk", "CASUAL")} />
                        </ListItem>
                    </List>
                </Collapse>
                {player && (
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
                                        sx={{ pl: 4 }}
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
                                    sx={{ pl: 4 }}
                                    onClick={closeDrawer}
                                >
                                    <ListItemText primary={getGameVariantString("jp", "CASUAL")} />
                                </ListItem>
                                {player.hongKongQualified && (
                                    <ListItem
                                        component={Link}
                                        to="/games/create/hk"
                                        sx={{ pl: 4 }}
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
                                    sx={{ pl: 4 }}
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
                        <ListItem
                            component={Link}
                            to="/games/current/jp"
                            sx={{ pl: 4 }}
                            onClick={closeDrawer}
                        >
                            <ListItemText primary={getGameVariantString("jp")} />
                        </ListItem>
                        <ListItem
                            component={Link}
                            to="/games/current/hk"
                            sx={{ pl: 4 }}
                            onClick={closeDrawer}
                        >
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
                {player && player.admin && (
                    <ListItem component={Link} to="/admin" onClick={closeDrawer}>
                        <ListItemText primary="Admin" />
                    </ListItem>
                )}
                {player ? (
                    <>
                        <ListItem onClick={() => setUserOpen(!userOpen)}>
                            <ListItemText primary={player.username} />
                            {userOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={userOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem
                                    component={Link}
                                    to="/settings"
                                    sx={{ pl: 4 }}
                                    onClick={closeDrawer}
                                >
                                    <ListItemText primary="Settings" />
                                </ListItem>
                                <ListItem
                                    sx={{ pl: 4 }}
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
        <>
            <Box
                component="a"
                href="#main-content"
                sx={{
                    position: "absolute",
                    left: "-9999px",
                    zIndex: 10000,
                    padding: "8px 16px",
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    textDecoration: "none",
                    borderRadius: 1,
                    "&:focus": {
                        left: "8px",
                        top: "8px",
                    },
                }}
            >
                Skip to main content
            </Box>
            <AppBar
                position="static"
                color="info"
                elevation={0}
                sx={{ borderBottom: 1, borderColor: "divider" }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography
                        variant="h3"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: isMobile ? 1 : 0,
                            color: "inherit",
                            mr: 5,
                            whiteSpace: "nowrap",
                        }}
                    >
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
                                    sx={{ mt: 2 }}
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
                                {player && (
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
                                            sx={{ mt: 2 }}
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
                                    sx={{ mt: 2 }}
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
                                <Button
                                    color="inherit"
                                    sx={navButton}
                                    component={Link}
                                    to="/stats/jp"
                                >
                                    Stats
                                </Button>
                                <Button
                                    color="inherit"
                                    sx={navButton}
                                    component={Link}
                                    to="/resources"
                                >
                                    Resources
                                </Button>
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={1}
                                divider={<Divider orientation="vertical" flexItem />}
                            >
                                {player && player.admin && (
                                    <Button
                                        color="inherit"
                                        sx={navButton}
                                        component={Link}
                                        to="/admin"
                                    >
                                        Admin
                                    </Button>
                                )}
                                {player ? (
                                    <>
                                        <Button
                                            color="inherit"
                                            sx={navButton}
                                            onClick={(e) => setUserAnchor(e.currentTarget)}
                                            aria-label="User menu"
                                            aria-haspopup="true"
                                            aria-expanded={Boolean(userAnchor)}
                                            endIcon={<KeyboardArrowDownIcon />}
                                            startIcon={
                                                <Avatar
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: 32,
                                                        height: 32,
                                                        fontSize: "0.875rem",
                                                        lineHeight: 0,
                                                        bgcolor: "primary.main",
                                                    }}
                                                >
                                                    {player.username[0].toUpperCase()}
                                                </Avatar>
                                            }
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
                                            sx={{ mt: 1 }}
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
                                    <Button
                                        color="inherit"
                                        sx={navButton}
                                        component={Link}
                                        to="/login"
                                    >
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
        </>
    );
};

export default memo(NavBar);
