import { Box } from "@mui/material";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import { EASE } from "./navStyles";

const LogoIcon = () => (
    <Box
        className="nav-logo"
        sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            background: "var(--mui-palette-glass-fill)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 1.25,
            flexShrink: 0,
            transition: `transform 0.3s ${EASE}, background 0.3s ${EASE}`,
            "@media (hover: hover)": {
                "&:hover": {
                    transform: "rotate(-8deg) scale(1.08)",
                    background: "var(--mui-palette-glass-iconHover)",
                },
            },
        }}
    >
        <HomeFilledIcon sx={{ color: "text.primary", fontSize: "1.4rem" }} aria-hidden="true" />
    </Box>
);

export default LogoIcon;
