import {
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Link,
    Stack,
    Typography,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GavelIcon from "@mui/icons-material/Gavel";
import IconBadge from "@/common/atoms/IconBadge";
import { shadow } from "@/theme/tokens";

interface ResourceLink {
    label: string;
    href: string;
    lang?: string;
}

interface ResourceGroup {
    title: string;
    links: ResourceLink[];
}

const riichiResources: ResourceGroup[] = [
    {
        title: "Rules",
        links: [
            { label: "Ruleset", href: "https://docs.google.com/document/d/1e-vHoRqpJArIZwo8wttzzWtZRBbppPmtn-FZ-qevVn8" },
            { label: "Rules and Etiquette", href: "https://docs.google.com/document/d/1SAMOHtm80w2xml9_VCZi3Mfq1XNrGfAamsZJvmpgi08" },
        ],
    },
    {
        title: "Tutorials",
        links: [
            { label: "Riichi Book 1", href: "https://github.com/dainachiba/RiichiBooks/raw/master/RiichiBook1.pdf" },
            { label: "Cheat Sheet", href: "https://drive.google.com/drive/folders/18hxO5DMVAqxSNV9VvpjAg6YjyPVAMzyS" },
        ],
    },
    {
        title: "Beginner's Luck",
        links: [
            { label: "Japanese", href: "http://beginners.biz/", lang: "JA" },
            { label: "Chinese", href: "https://www.bilibili.com/read/readlist/rl45758", lang: "ZH" },
        ],
    },
    {
        title: "Uzaku's tile efficiency",
        links: [
            { label: "English", href: "https://drive.google.com/file/d/1ApHp2Dm-3dkEQTEAnmfTsk8J6OaH8d4G/view", lang: "EN" },
            { label: "Chinese", href: "https://www.bilibili.com/read/readlist/rl509592", lang: "ZH" },
        ],
    },
    {
        title: "WWYD 300",
        links: [
            { label: "English", href: "https://files.riichi.moe/mjg/books%20(en)/300%20Established%20Practice%20Which%20to%20cut%20%28wwyd-chan%201%29.pdf", lang: "EN" },
            { label: "Chinese", href: "https://www.bilibili.com/read/readlist/rl380536", lang: "ZH" },
        ],
    },
    {
        title: "WWYD 301",
        links: [
            { label: "English", href: "https://drive.google.com/file/d/1HQcoZ96XSVnEzy_ABNOxkxHLYQgYAeWr/view", lang: "EN" },
            { label: "Chinese", href: "https://www.bilibili.com/read/readlist/rl493079", lang: "ZH" },
        ],
    },
];

const hkResources: ResourceGroup[] = [
    {
        title: "Rules",
        links: [
            { label: "Charter", href: "https://docs.google.com/document/d/1ECK29S6p-Lx63P6eMkM2bnQY7mueEout8MvZS13A4Hk" },
        ],
    },
];

const ResourceSection = ({ title, icon, groups }: { title: string; icon: React.ReactNode; groups: ResourceGroup[] }) => (
    <Card>
        <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <IconBadge>{icon}</IconBadge>
                <Typography variant="h4">{title}</Typography>
            </Stack>

            <Stack divider={<Divider sx={{ my: 0.25 }} />} spacing={0}>
                {groups.map((group) => (
                    <Box key={group.title} sx={{ py: 1.25, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180, fontWeight: 500 }}>
                            {group.title}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {group.links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="none"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        px: 1.25,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        color: "primary.main",
                                        fontSize: "0.8rem",
                                        fontWeight: 500,
                                        transition: "all 0.14s",
                                        "&:hover": {
                                            bgcolor: "primary.main",
                                            color: "white",
                                            borderColor: "primary.main",
                                            transform: "translateY(-1px)",
                                            boxShadow: shadow.button,
                                        },
                                    }}
                                >
                                    {link.label}
                                    {link.lang && (
                                        <Chip
                                            label={link.lang}
                                            size="small"
                                            sx={{ height: 16, fontSize: "0.6rem", ml: 0.25, pointerEvents: "none" }}
                                        />
                                    )}
                                    <OpenInNewIcon sx={{ fontSize: 11 }} />
                                </Link>
                            ))}
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </CardContent>
    </Card>
);

export const Resources = () => (
    <Container maxWidth="md">
        <Stack spacing={3}>
            <Box>
                <Typography variant="h1" gutterBottom>
                    Study Resources
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Learning materials for Riichi and Hong Kong mahjong
                </Typography>
            </Box>

            <ResourceSection
                title="Riichi Mahjong"
                icon={<MenuBookIcon fontSize="small" />}
                groups={riichiResources}
            />
            <ResourceSection
                title="Hong Kong Mahjong"
                icon={<GavelIcon fontSize="small" />}
                groups={hkResources}
            />
        </Stack>
    </Container>
);
