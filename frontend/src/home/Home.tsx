import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Link,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import ChatIcon from "@mui/icons-material/Chat";
import DescriptionIcon from "@mui/icons-material/Description";
import logo from "../assets/MJC square.png";

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    color?: string;
}

const InfoCard = ({ icon, title, children, color }: InfoCardProps) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                    borderColor: color || theme.palette.primary.main,
                },
            }}
        >
            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                backgroundColor: color ? `${color}15` : "primary.light",
                                color: color || "primary.main",
                            }}
                        >
                            {icon}
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: "text.primary",
                            }}
                        >
                            {title}
                        </Typography>
                    </Stack>
                    <Box sx={{ color: "text.secondary" }}>{children}</Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const Home = () => {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={4}>
                {/* Hero Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4, md: 6 },
                        borderRadius: 3,
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)"
                                : "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)",
                        border: `1px solid ${theme.palette.divider}`,
                        textAlign: "center",
                    }}
                >
                    <Stack spacing={3} alignItems="center">
                        <Box
                            component="img"
                            src={logo}
                            alt="UBC Mahjong Club Logo"
                            sx={{
                                width: { xs: "80%", sm: "60%", md: "40%" },
                                maxWidth: 400,
                                height: "auto",
                                borderRadius: 2,
                                boxShadow: theme.shadows[8],
                            }}
                        />
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                            }}
                        >
                            UBC Mahjong Club
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "text.secondary",
                                maxWidth: 600,
                            }}
                        >
                            Welcome to the official home of the University of British Columbia Mahjong
                            Club
                        </Typography>
                    </Stack>
                </Paper>

                {/* Information Cards */}
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <InfoCard
                            icon={<LocationOnIcon />}
                            title="Location"
                            color={theme.palette.error.main}
                        >
                            <Typography variant="body1">Room 3206B, The Nest</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                The University of British Columbia
                                <br />
                                Vancouver, BC
                            </Typography>
                        </InfoCard>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <InfoCard
                            icon={<ChatIcon />}
                            title="Join Our Discord"
                            color={theme.palette.info.main}
                        >
                            <Typography variant="body2" sx={{ mb: 1.5 }}>
                                Stay updated with the latest information and connect with other
                                members!
                            </Typography>
                            <Link
                                href="https://discord.gg/93mksWsQNB"
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="none"
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    px: 2,
                                    py: 1,
                                    borderRadius: 1.5,
                                    backgroundColor: theme.palette.info.main,
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        backgroundColor: theme.palette.info.dark,
                                        transform: "translateY(-2px)",
                                        boxShadow: theme.shadows[4],
                                    },
                                }}
                            >
                                Join Discord Server
                            </Link>
                        </InfoCard>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <InfoCard
                            icon={<InstagramIcon />}
                            title="Instagram"
                            color={theme.palette.secondary.main}
                        >
                            <Typography variant="body2" sx={{ mb: 1.5 }}>
                                Follow us for updates, event photos, and announcements
                            </Typography>
                            <Link
                                href="https://www.instagram.com/ubcmahjongclub"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    color: theme.palette.secondary.main,
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    textDecoration: "none",
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                @ubcmahjongclub
                            </Link>
                        </InfoCard>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <InfoCard
                            icon={<EmailIcon />}
                            title="Contact Us"
                            color={theme.palette.success.main}
                        >
                            <Typography variant="body2" sx={{ mb: 1.5 }}>
                                Have questions? Reach out to us via email
                            </Typography>
                            <Link
                                href="mailto:ubcmahjongclub@gmail.com"
                                sx={{
                                    color: theme.palette.success.main,
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    textDecoration: "none",
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                ubcmahjongclub@gmail.com
                            </Link>
                        </InfoCard>
                    </Grid>
                </Grid>

                {/* Terms and Conditions */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(0, 0, 0, 0.01)",
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                backgroundColor: `${theme.palette.warning.main}15`,
                                color: theme.palette.warning.main,
                            }}
                        >
                            <DescriptionIcon />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                                Before participating, please review our
                            </Typography>
                            <Link
                                href="https://docs.google.com/document/d/1JcCKNW-aOUuAdWWWS2mtQfiJNOOuArgwCL9lGysXDAY"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    color: "primary.main",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    textDecoration: "none",
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                Terms and Conditions
                            </Link>
                        </Box>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
};

export default Home;
