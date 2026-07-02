import { Box, Button, Chip, Container, Link, Stack, Typography, alpha } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import RoomIcon from "@mui/icons-material/Room";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import ForumIcon from "@mui/icons-material/Forum";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { gradientTitle } from "@/theme/utils";
import logo from "../assets/MJC square.png";

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
                flex: { xs: "1 1 100%", sm: "1 1 240px" },
                minWidth: 0,
                px: 2.25,
                py: 1.25,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "var(--mui-palette-overlayN-header)",
                color: "text.primary",
                textDecoration: "none",
                transition: "border-color 0.16s ease, background 0.16s ease, transform 0.16s ease",
                "@media (hover: hover)": {
                    "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.5),
                        transform: "translateY(-1px)",
                    },
                },
            }}
        >
            <Box sx={{ display: "flex", color: "primary.light", flexShrink: 0 }}>
                {item.icon}
            </Box>
            <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 500, lineHeight: 1.5, minWidth: 0 }}
            >
                {item.label}
            </Typography>
        </Stack>
    );
};

const Hero = () => (
    <Box
        sx={{
            position: "relative",
            overflow: "hidden",
            background: "var(--mui-palette-gradient-hero)",
            borderBottom: "1px solid",
            borderColor: (t) => alpha(t.palette.primary.main, 0.18),
            // Guarantee enough vertical room for the portrait artwork on wide
            // (e.g. 16:9) screens, where the content alone wouldn't make the
            // hero tall enough to show the full figure.
            minHeight: { md: 560, lg: 640 },
            display: "flex",
            alignItems: "center",
        }}
    >
        {/* Hero illustration — full-bleed 16:9 artwork. `cover` fills the hero
            at any aspect ratio; the figure sits on the right of the image, so
            it's kept in frame while the left (lighter) side falls under the
            scrim that carries the copy. */}
        <Box
            aria-hidden
            sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url(/hero.webp)",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: { xs: "72% center", md: "center" },
                // Feather the right 30% and bottom 30% of the artwork to
                // transparent so it blends into the dark hero base on those
                // edges (mirrors the left-side fade). Two directional gradients
                // combined with `intersect` so both fades apply at once.
                maskImage:
                    "linear-gradient(to right, #000 70%, transparent), linear-gradient(to bottom, #000 70%, transparent)",
                maskComposite: "intersect",
                WebkitMaskImage:
                    "linear-gradient(to right, #000 70%, transparent), linear-gradient(to bottom, #000 70%, transparent)",
                WebkitMaskComposite: "source-in",
                maskRepeat: "no-repeat",
                pointerEvents: "none",
            }}
        />
        {/* Scrim — always a left-anchored horizontal gradient so the dark,
            copy-bearing side stays pinned to the left at every width (it must
            never flip to the right on narrow screens). Kept dark enough on the
            left for legibility while clearing to reveal the figure on the right. */}
        <Box
            aria-hidden
            sx={{
                position: "absolute",
                inset: 0,
                background: "var(--mui-palette-gradient-heroScrim)",
                pointerEvents: "none",
            }}
        />
        {/* Linear accent glow descending from the top of the hero. */}
        <Box
            aria-hidden
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: { xs: 220, md: 300 },
                background: (t) =>
                    `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.28)} 0%, ${alpha(
                        t.palette.primary.main,
                        0.08,
                    )} 45%, transparent 100%)`,
                pointerEvents: "none",
            }}
        />

        <Container
            maxWidth="lg"
            sx={{ position: "relative", width: "100%", py: { xs: 4, sm: 5, md: 7 } }}
        >
            {/* Brand + description sit in a left-biased column so they don't
                overlap the figure; the CTAs and contact strip below span the
                full width to fill the hero. */}
            <Box sx={{ maxWidth: { xs: "100%", md: 720, lg: 820 } }}>
                {/* Brand — logo + title */}
                <Stack
                    direction="row"
                    spacing={{ xs: 2, sm: 3 }}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="UBC Mahjong Club Logo"
                        sx={{
                            width: { xs: 72, sm: 104, md: 128 },
                            height: { xs: 72, sm: 104, md: 128 },
                            borderRadius: 3,
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
                        <Typography variant="h1" sx={{ ...gradientTitle }}>
                            UBC Mahjong Club
                        </Typography>
                    </Box>
                </Stack>

                <Typography
                    sx={{
                        mt: 3,
                        color: "text.secondary",
                        fontSize: { xs: "1rem", md: "1.15rem" },
                        lineHeight: 1.7,
                        maxWidth: 620,
                    }}
                >
                    Riichi &amp; Hong Kong mahjong for UBC students and the wider community —
                    play casually or climb the competitive ladder.
                </Typography>

                <Box sx={{ mt: 2.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <HeroChip label="Season Active" />
                    <HeroChip label="VRO 2026 Open" />
                </Box>

                {/* Clubroom location — inline beneath the brand */}
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{ mt: 3, rowGap: 0.5 }}
                >
                    <RoomIcon sx={{ fontSize: 18, color: "primary.light" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Room 3206B, The Nest
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        · UBC Vancouver, all levels welcome
                    </Typography>
                </Stack>
            </Box>

            {/* Primary calls to action — full width to fill the hero */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: { xs: 4, md: 6 } }}
            >
                <Button
                    component={RouterLink}
                    to="/leaderboard"
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
);

export default Hero;
