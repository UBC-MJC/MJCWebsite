import {
    Box,
    Button,
    Chip,
    Container,
    Link,
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import RoomIcon from "@mui/icons-material/Room";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import ForumIcon from "@mui/icons-material/Forum";
import GavelIcon from "@mui/icons-material/Gavel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import IconBadge from "@/common/atoms/IconBadge";
import SectionHeader from "@/common/atoms/SectionHeader";
import { gradientTitle } from "@/theme/utils";
import logo from "../assets/MJC square.png";
import riichiStick from "../assets/riichiStick.png";

interface LinkItem {
    icon: React.ReactNode;
    label: string;
    desc: string;
    href: string;
    chipLabel?: string;
    chipColor?: "success" | "warning" | "error" | "info" | "default";
    internal?: boolean;
}

interface ContactItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

const contactItems: ContactItem[] = [
    {
        icon: <EmailIcon sx={{ fontSize: 18 }} />,
        label: "ubcmahjongclub@gmail.com",
        href: "mailto:ubcmahjongclub@gmail.com",
    },
    {
        icon: <InstagramIcon sx={{ fontSize: 18 }} />,
        label: "@ubcmahjongclub",
        href: "https://www.instagram.com/ubcmahjongclub",
    },
    {
        icon: <ForumIcon sx={{ fontSize: 18 }} />,
        label: "Join our Discord",
        href: "https://discord.gg/93mksWsQNB",
    },
];

const linkItems: LinkItem[] = [
    {
        icon: <EmojiEventsIcon sx={{ fontSize: 20 }} />,
        label: "Vancouver Riichi Open 2026",
        desc: "Register for the annual tournament — open now!",
        href: "/vro2026",
        chipLabel: "Open",
        chipColor: "success",
        internal: true,
    },
    {
        icon: <GavelIcon sx={{ fontSize: 20 }} />,
        label: "Terms & Conditions",
        desc: "Club rules and code of conduct",
        href: "https://docs.google.com/document/d/1JcCKNW-aOUuAdWWWS2mtQfiJNOOuArgwCL9lGysXDAY",
    },
];

// ─── Atoms / Molecules ────────────────────────────────────────────────────────

const HeroChip = ({ label }: { label: string }) => (
    <Chip
        label={label}
        size="small"
        sx={{
            bgcolor: (t) => alpha(t.palette.primary.main, 0.18),
            color: "primary.light",
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
            fontWeight: 600,
            fontSize: "0.7rem",
            "& .MuiChip-label": { px: 1 },
        }}
    />
);

const ContactPill = ({ item }: { item: ContactItem }) => {
    const isExternal = item.href.startsWith("http");
    return (
        <Stack
            component={Link}
            href={item.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{
                flex: { xs: "1 1 100%", sm: "1 1 200px" },
                minWidth: 0,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: (t) =>
                    t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "grey.50",
                color: "text.primary",
                textDecoration: "none",
                transition: "border-color 0.16s ease, background 0.16s ease, transform 0.16s ease",
                "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    transform: "translateY(-1px)",
                },
            }}
        >
            <Box sx={{ display: "flex", color: "primary.light", flexShrink: 0 }}>
                {item.icon}
            </Box>
            <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 500, lineHeight: 1, minWidth: 0 }}
            >
                {item.label}
            </Typography>
        </Stack>
    );
};

const LinkCard = ({ item }: { item: LinkItem }) => (
    <Box
        component={item.internal ? RouterLink : "a"}
        {...(item.internal ? { to: item.href } : { href: item.href })}
        target={item.internal ? undefined : "_blank"}
        rel={item.internal ? undefined : "noopener noreferrer"}
        sx={{
            flex: { xs: "1 1 100%", sm: "1 1 320px" },
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            textDecoration: "none",
            color: "text.primary",
            transition: "border-color 0.16s ease, background 0.16s ease, transform 0.16s ease",
            "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
                transform: "translateY(-2px)",
                "& .link-arrow": { opacity: 1, transform: "translateX(3px)" },
            },
        }}
    >
        <IconBadge
            sx={{
                bgcolor: (t) =>
                    t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "grey.100",
                color: "primary.main",
            }}
        >
            {item.icon}
        </IconBadge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" fontWeight={600} noWrap>
                    {item.label}
                </Typography>
                {item.chipLabel && (
                    <Chip
                        label={item.chipLabel}
                        color={item.chipColor}
                        size="small"
                        sx={{ height: 18, fontSize: "0.65rem", flexShrink: 0 }}
                    />
                )}
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                {item.desc}
            </Typography>
        </Box>
        <Box
            className="link-arrow"
            sx={{
                color: "text.disabled",
                opacity: 0.5,
                flexShrink: 0,
                transition: "opacity 0.14s, transform 0.14s",
                fontSize: "1.1rem",
            }}
        >
            →
        </Box>
    </Box>
);

// ─── Page ────────────────────────────────────────────────────────────────────

const Home = () => (
    <Box>
        {/* ── Full-bleed expansive hero ─────────────────────────────────────── */}
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, #1A1416 0%, #161617 45%, #0B0B0C 100%)",
                borderBottom: "1px solid",
                borderColor: (t) => alpha(t.palette.primary.main, 0.18),
                // Soft accent glow in the top-right corner.
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -140,
                    right: { xs: "-30%", sm: "-8%" },
                    width: 480,
                    height: 480,
                    borderRadius: "50%",
                    background: (t) =>
                        `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.24)}, transparent 70%)`,
                    pointerEvents: "none",
                },
            }}
        >
            {/* Decorative riichi stick */}
            <Box
                component="img"
                src={riichiStick}
                alt=""
                aria-hidden
                sx={{
                    position: "absolute",
                    right: { sm: -20, md: 60 },
                    bottom: { sm: -60, md: -80 },
                    width: { sm: 340, md: 460 },
                    opacity: 0.06,
                    transform: "rotate(-18deg)",
                    pointerEvents: "none",
                    display: { xs: "none", sm: "block" },
                }}
            />

            <Container
                maxWidth="lg"
                sx={{ position: "relative", py: { xs: 4, sm: 5, md: 7 } }}
            >
                {/* Brand + location split */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 3, md: 5 }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                >
                    {/* Left — brand title + description */}
                    <Stack
                        direction="row"
                        spacing={{ xs: 2, sm: 3 }}
                        alignItems="center"
                        sx={{ minWidth: 0, flex: 1 }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="UBC Mahjong Club Logo"
                            sx={{
                                width: { xs: 64, sm: 88, md: 104 },
                                height: { xs: 64, sm: 88, md: 104 },
                                borderRadius: 2.5,
                                border: (t) => `2px solid ${alpha(t.palette.primary.main, 0.45)}`,
                                boxShadow: (t) =>
                                    `0 8px 28px ${alpha(t.palette.primary.main, 0.25)}`,
                                flexShrink: 0,
                            }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="overline"
                                sx={{
                                    color: "primary.light",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    display: "block",
                                    mb: 0.5,
                                }}
                            >
                                University of British Columbia
                            </Typography>
                            <Typography variant="h1" sx={{ ...gradientTitle, mb: 2.5 }}>
                                UBC Mahjong Club
                            </Typography>
                            <Typography
                                sx={{
                                    color: "text.secondary",
                                    fontSize: { xs: "0.9rem", md: "1rem" },
                                    lineHeight: 1.65,
                                    maxWidth: 520,
                                }}
                            >
                                Riichi &amp; Hong Kong mahjong for UBC students and the wider
                                community — play casually or climb the competitive ladder.
                            </Typography>
                            <Box sx={{ mt: 2.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                <HeroChip label="Season Active" />
                                <HeroChip label="VRO 2026 Open" />
                            </Box>
                        </Box>
                    </Stack>

                    {/* Right — clubroom location */}
                    <Stack
                        spacing={0.75}
                        alignItems={{ xs: "flex-start", md: "flex-end" }}
                        sx={{
                            flexShrink: 0,
                            textAlign: { xs: "left", md: "right" },
                            borderLeft: { md: "1px solid" },
                            borderColor: { md: "divider" },
                            pl: { md: 4 },
                        }}
                    >
                        <Typography
                            variant="overline"
                            sx={{
                                color: "text.secondary",
                                fontWeight: 600,
                                letterSpacing: "0.1em",
                                lineHeight: 1,
                            }}
                        >
                            Clubroom
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                            <RoomIcon sx={{ fontSize: 18, color: "primary.light" }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                Room 3206B, The Nest
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            UBC Vancouver · all levels welcome
                        </Typography>
                    </Stack>
                </Stack>

                {/* Primary calls to action */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ mt: { xs: 4, md: 5 }, position: "relative" }}
                >
                    <Button
                        component={RouterLink}
                        to="/leaderboard/jp"
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<LeaderboardIcon />}
                        sx={{ width: { xs: "100%", sm: "auto" }, px: { sm: 3.5 } }}
                    >
                        View Leaderboards
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/games/current"
                        variant="outlined"
                        color="primary"
                        size="large"
                        startIcon={<SportsEsportsIcon />}
                        sx={{ width: { xs: "100%", sm: "auto" }, px: { sm: 3.5 } }}
                    >
                        Live Games
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/resources"
                        variant="text"
                        color="inherit"
                        size="large"
                        sx={{ width: { xs: "100%", sm: "auto" }, color: "text.secondary" }}
                    >
                        Learn to Play
                    </Button>
                </Stack>

                {/* Contact strip — folded seamlessly into the hero */}
                <Box sx={{ mt: { xs: 4, md: 5 } }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "primary.light",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            display: "block",
                            mb: 1.25,
                        }}
                    >
                        Get in touch
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={1.25}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="stretch"
                        sx={{ width: "100%" }}
                    >
                        {contactItems.map((item) => (
                            <ContactPill key={item.label} item={item} />
                        ))}
                    </Stack>
                </Box>
            </Container>
        </Box>

        {/* ── Constrained content below the hero ────────────────────────────── */}
        <Container maxWidth="lg">
            <Box>
                <SectionHeader label="Links & Resources" />
                <Stack
                    direction="row"
                    spacing={2}
                    useFlexGap
                    flexWrap="wrap"
                    alignItems="stretch"
                    sx={{ width: "100%" }}
                >
                    {linkItems.map((item) => (
                        <LinkCard key={item.label} item={item} />
                    ))}
                </Stack>
            </Box>
        </Container>
    </Box>
);

export default Home;
