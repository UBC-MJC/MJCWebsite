import { Box, Typography } from "@mui/material";
import { Link } from "react-router";

// "UBC Mahjong" on phones leaves room for the New game button down to 320px. A link isn't a ButtonBase, so it
// needs the theme's focus ring spelled out
const Wordmark = ({ onClick }: { onClick?: () => void }) => (
    <Typography
        component={Link}
        to="/"
        onClick={onClick}
        noWrap
        sx={(theme) => ({
            minWidth: 0,
            color: "text.primary",
            fontSize: "1.125rem",
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: 0.5,
            "&:focus-visible": {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
            },
        })}
    >
        UBC Mahjong
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            {" "}
            Club
        </Box>
    </Typography>
);

export default Wordmark;
