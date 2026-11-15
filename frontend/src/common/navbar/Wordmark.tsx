import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router";
import { focusRing, truncate } from "@/theme/utils";

const WordmarkLink = styled(Link)(({ theme }) => ({
    ...truncate,
    minWidth: 0,
    color: theme.palette.text.primary,
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: "44px", // the whole line is the touch target
    textDecoration: "none",
    borderRadius: 2,
    "&:focus-visible": focusRing(theme),
}));

const Wordmark = ({ onClick }: { onClick?: () => void }) => (
    <WordmarkLink to="/" onClick={onClick}>
        UBC Mahjong
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            {" "}
            Club
        </Box>
    </WordmarkLink>
);

export default Wordmark;
