import {
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Link,
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import ForumIcon from "@mui/icons-material/Forum";
import GavelIcon from "@mui/icons-material/Gavel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import IconBadge from "@/common/atoms/IconBadge";
import SectionHeader from "@/common/atoms/SectionHeader";
import { shadow } from "@/theme/tokens";
import logo from "../assets/MJC square.png";

interface InfoItem {
    icon: React.ReactNode;
    label: string;
    content: React.ReactNode;
    sub: string;
}

interface LinkItem {
    icon: React.ReactNode;
    label: string;
    desc: string;
    href: string;
    chipLabel?: string;
    chipColor?: "success" | "warning" | "error" | "info" | "default";
    internal?: boolean;
}

const infoItems: InfoItem[] = [
    {
        icon: <RoomIcon sx={{ fontSize: 20 }} />,
        label: "Location",
        content: "Room 3206B, The Nest",
        sub: "University of British Columbia, Vancouver, BC",
    },
    {
        icon: <EmailIcon sx={{ fontSize: 20 }} />,
        label: "Email",
        content: (
            <Link href="mailto:ubcmahjongclub@gmail.com" underline="hover">
                ubcmahjongclub@gmail.com
            </Link>
        ),
        sub: "We usually respond within a day",
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
        icon: <InstagramIcon sx={{ fontSize: 20 }} />,
        label: "Instagram",
        desc: "@ubcmahjongclub",
        href: "https://www.instagram.com/ubcmahjongclub",
    },
    {
        icon: <ForumIcon sx={{ fontSize: 20 }} />,
        label: "Discord",
        desc: "Join our server for the latest club news",
        href: "https://discord.gg/93mksWsQNB",
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
            bgcolor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            "& .MuiChip-label": { px: 1 },
        }}
    />
);

const InfoCard = ({ item }: { item: InfoItem }) => (
    <Card
        sx={{
            height: "100%",
            transition: "all 0.2s ease",
            "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: shadow.md,
            },
        }}
    >
        <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <IconBadge>{item.icon}</IconBadge>
                <Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.secondary",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                        }}
                    >
                        {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25 }}>
                        {item.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {item.sub}
                    </Typography>
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

const LinkRow = ({ item }: { item: LinkItem }) => (
    <Box
        component={item.internal ? Link : "a"}
        href={item.href}
        target={item.internal ? undefined : "_blank"}
        rel={item.internal ? undefined : "noopener noreferrer"}
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 1.75,
            textDecoration: "none",
            color: "text.primary",
            transition: "background 0.14s, padding-left 0.16s",
            "&:hover": {
                bgcolor: "action.hover",
                pl: "24px",
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
                <Typography variant="body2" fontWeight={500}>
                    {item.label}
                </Typography>
                {item.chipLabel && (
                    <Chip
                        label={item.chipLabel}
                        color={item.chipColor}
                        size="small"
                        sx={{ height: 18, fontSize: "0.65rem" }}
                    />
                )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
                {item.desc}
            </Typography>
        </Box>
        <Box
            className="link-arrow"
            sx={{
                color: "text.disabled",
                opacity: 0.5,
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
    <Container maxWidth="md">
        <Stack spacing={4}>
            {/* Hero */}
            <Card sx={{ overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #161617, #0B0B0C)",
                        borderBottom: "1px solid",
                        borderColor: (t) => alpha(t.palette.primary.main, 0.3),
                        px: 3,
                        py: 2.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="UBC Mahjong Club Logo"
                        sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 60, sm: 80 },
                            borderRadius: 2,
                            border: (t) => `2px solid ${alpha(t.palette.primary.main, 0.4)}`,
                            flexShrink: 0,
                        }}
                    />
                    <Box>
                        <Typography variant="h2" sx={{ color: "primary.light", fontWeight: 700, mb: 0.5 }}>
                            UBC Mahjong Club
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                            Riichi &amp; Hong Kong mahjong for UBC students and community.
                            Record games, track ratings, and compete.
                        </Typography>
                        <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <HeroChip label="Season Active" />
                            <HeroChip label="VRO 2026 Open" />
                        </Box>
                    </Box>
                </Box>
            </Card>

            {/* Info cards */}
            <Box>
                <SectionHeader label="Club Info" />
                <Grid container spacing={2}>
                    {infoItems.map((item) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                            <InfoCard item={item} />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Links */}
            <Box>
                <SectionHeader label="Links & Resources" />
                <Card>
                    <Stack divider={<Divider />}>
                        {linkItems.map((item) => (
                            <LinkRow key={item.label} item={item} />
                        ))}
                    </Stack>
                </Card>
            </Box>
        </Stack>
    </Container>
);

export default Home;