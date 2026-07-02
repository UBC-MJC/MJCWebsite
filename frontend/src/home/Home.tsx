import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import IconBadge from "@/common/atoms/IconBadge";
import SectionHeader from "@/common/atoms/SectionHeader";
import Hero from "./Hero";

interface LinkItem {
    icon: React.ReactNode;
    label: string;
    desc: string;
    href: string;
    chipLabel?: string;
    chipColor?: "success" | "warning" | "error" | "info" | "default";
    internal?: boolean;
}

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
            "@media (hover: hover)": {
                "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                    transform: "translateY(-2px)",
                    "& .link-arrow": { opacity: 1, transform: "translateX(3px)" },
                },
            },
        }}
    >
        <IconBadge
            sx={{
                bgcolor: "var(--mui-palette-overlayN-hover)",
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
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", textAlign: "left" }}>
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

const Home = () => (
    <Box>
        <Hero />

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
