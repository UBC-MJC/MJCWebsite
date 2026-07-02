import { useState } from "react";
import { Box, ButtonBase, Collapse, Stack, Typography, alpha } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

/** A single, not-yet-satisfied prerequisite for submitting the round being entered. */
export interface RoundRequirement {
    id: string;
    description: string;
}

interface RoundRequirementsProps {
    requirements: RoundRequirement[];
}

/**
 * A small collapsible panel listing the requirements still blocking submission.
 * Defaults to collapsed (the count stays visible in the header); the player can
 * expand it to see the details. Renders nothing when the round is ready to submit.
 */
const RoundRequirements = ({ requirements }: RoundRequirementsProps) => {
    const [open, setOpen] = useState(false);

    if (requirements.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.warning.main, 0.4),
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.06),
            }}
        >
            <ButtonBase
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    gap: 1,
                    px: 2,
                    py: 1.25,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <ErrorOutlineIcon sx={{ color: "warning.main", fontSize: "1.2rem" }} />
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "text.secondary",
                        }}
                    >
                        {requirements.length}{" "}
                        {requirements.length === 1 ? "requirement" : "requirements"} left
                    </Typography>
                </Stack>
                <ExpandMoreIcon
                    sx={{
                        color: "text.secondary",
                        transition: "transform 0.2s ease",
                        transform: open ? "rotate(180deg)" : "none",
                    }}
                />
            </ButtonBase>
            <Collapse in={open}>
                <Stack
                    component="ul"
                    role="list"
                    aria-live="polite"
                    spacing={1}
                    sx={{ listStyle: "none", m: 0, px: 2, pt: 0.5, pb: 1.75 }}
                >
                    {requirements.map((req) => (
                        <Stack
                            key={req.id}
                            component="li"
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <FiberManualRecordIcon
                                sx={{ fontSize: "0.5rem", color: "warning.main", flexShrink: 0 }}
                            />
                            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                                {req.description}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Collapse>
        </Box>
    );
};

export default RoundRequirements;
