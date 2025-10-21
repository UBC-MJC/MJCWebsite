import {
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Link,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionIcon from "@mui/icons-material/Description";

interface ResourceLinkProps {
    href: string;
    label: string;
    language?: string;
}

const ResourceLink = ({ href, label, language }: ResourceLinkProps) => {
    const theme = useTheme();

    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 2,
                py: 1,
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.2s ease-in-out",
                color: "primary.main",
                fontWeight: 500,
                fontSize: "0.875rem",
                "&:hover": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[2],
                },
            }}
        >
            {label}
            {language && (
                <Chip
                    label={language}
                    size="small"
                    sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        ml: 0.5,
                    }}
                />
            )}
            <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
        </Link>
    );
};

interface ResourceItemProps {
    title: string;
    links: Array<{ href: string; label: string; language?: string }>;
}

const ResourceItem = ({ title, links }: ResourceItemProps) => {
    return (
        <Box
            sx={{
                py: 2,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                "&:last-child": {
                    borderBottom: "none",
                },
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: "text.primary",
                }}
            >
                {title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
                {links.map((link, index) => (
                    <ResourceLink key={index} {...link} />
                ))}
            </Stack>
        </Box>
    );
};

interface ResourceSectionProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}

const ResourceSection = ({ title, icon, color, children }: ResourceSectionProps) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    boxShadow: theme.shadows[4],
                },
            }}
        >
            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            backgroundColor: `${color}15`,
                            color: color,
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                            fontWeight: 600,
                            color: "text.primary",
                        }}
                    >
                        {title}
                    </Typography>
                </Stack>
                <Stack spacing={0}>{children}</Stack>
            </CardContent>
        </Card>
    );
};

export const Resources = () => {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={4}>
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        Study Resources
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "text.secondary",
                        }}
                    >
                        Comprehensive guides, tutorials, and reference materials for learning mahjong
                    </Typography>
                </Box>

                <Stack spacing={3}>
                    <ResourceSection
                        title="Riichi Mahjong"
                        icon={<MenuBookIcon />}
                        color={theme.palette.primary.main}
                    >
                        <ResourceItem
                            title="Official Rules"
                            links={[
                                {
                                    href: "https://docs.google.com/document/d/1e-vHoRqpJArIZwo8wttzzWtZRBbppPmtn-FZ-qevVn8",
                                    label: "Ruleset",
                                },
                                {
                                    href: "https://docs.google.com/document/d/1SAMOHtm80w2xml9_VCZi3Mfq1XNrGfAamsZJvmpgi08",
                                    label: "Rules and Etiquette",
                                },
                            ]}
                        />
                    </ResourceSection>

                    <ResourceSection
                        title="Tutorials & Guides"
                        icon={<SchoolIcon />}
                        color={theme.palette.success.main}
                    >
                        <ResourceItem
                            title="Riichi Book 1"
                            links={[
                                {
                                    href: "https://github.com/dainachiba/RiichiBooks/raw/master/RiichiBook1.pdf",
                                    label: "Download PDF",
                                },
                            ]}
                        />
                        <ResourceItem
                            title="Cheat Sheet"
                            links={[
                                {
                                    href: "https://drive.google.com/drive/folders/18hxO5DMVAqxSNV9VvpjAg6YjyPVAMzyS",
                                    label: "View Collection",
                                },
                            ]}
                        />
                        <ResourceItem
                            title="Beginner's Luck"
                            links={[
                                {
                                    href: "http://beginners.biz/",
                                    label: "Read Guide",
                                    language: "Japanese",
                                },
                                {
                                    href: "https://www.bilibili.com/read/readlist/rl45758",
                                    label: "Read Guide",
                                    language: "Chinese",
                                },
                            ]}
                        />
                        <ResourceItem
                            title="Uzaku's Tile Efficiency"
                            links={[
                                {
                                    href: "https://drive.google.com/file/d/1ApHp2Dm-3dkEQTEAnmfTsk8J6OaH8d4G/view",
                                    label: "Read Guide",
                                    language: "English",
                                },
                                {
                                    href: "https://www.bilibili.com/read/readlist/rl509592",
                                    label: "Read Guide",
                                    language: "Chinese",
                                },
                            ]}
                        />
                        <ResourceItem
                            title="WWYD 300 - Established Practice"
                            links={[
                                {
                                    href: "https://files.riichi.moe/mjg/books%20(en)/300%20Established%20Practice%20Which%20to%20cut%20%28wwyd-chan%201%29.pdf",
                                    label: "Download PDF",
                                    language: "English",
                                },
                                {
                                    href: "https://www.bilibili.com/read/readlist/rl380536",
                                    label: "Read Online",
                                    language: "Chinese",
                                },
                            ]}
                        />
                        <ResourceItem
                            title="WWYD 301 - Advanced Practice"
                            links={[
                                {
                                    href: "https://drive.google.com/file/d/1HQcoZ96XSVnEzy_ABNOxkxHLYQgYAeWr/view",
                                    label: "Download PDF",
                                    language: "English",
                                },
                                {
                                    href: "https://www.bilibili.com/read/readlist/rl493079",
                                    label: "Read Online",
                                    language: "Chinese",
                                },
                            ]}
                        />
                    </ResourceSection>

                    <ResourceSection
                        title="Hong Kong Mahjong"
                        icon={<DescriptionIcon />}
                        color={theme.palette.info.main}
                    >
                        <ResourceItem
                            title="Official Charter"
                            links={[
                                {
                                    href: "https://docs.google.com/document/d/1ECK29S6p-Lx63P6eMkM2bnQY7mueEout8MvZS13A4Hk",
                                    label: "View Document",
                                },
                            ]}
                        />
                    </ResourceSection>
                </Stack>
            </Stack>
        </Container>
    );
};
