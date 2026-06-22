import { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

interface StepSectionProps {
    /** 1-based step number shown in the leading badge. */
    step: number;
    /** Short, scannable section title (e.g. "Result", "Players", "Points"). */
    title: string;
    /** Optional muted hint shown to the right of the title. */
    hint?: string;
    children: ReactNode;
}

/**
 * A numbered section used to turn the round recorder into a guided, top-to-bottom
 * workflow. The leading badge + uppercase label establish a clear reading order
 * (Hick's Law / progressive disclosure) so the recorder reads as discrete steps
 * rather than one dense wall of controls.
 */
const StepSection = ({ step, title, hint, children }: StepSectionProps) => (
    <Box sx={{ width: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
            <Box
                aria-hidden
                sx={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: "primary.main",
                    bgcolor: (theme) => `${theme.palette.primary.main}26`,
                }}
            >
                {step}
            </Box>
            <Typography
                sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "text.secondary",
                }}
            >
                {title}
            </Typography>
            {hint && (
                <Typography
                    sx={{
                        fontSize: "0.78rem",
                        color: "text.disabled",
                        ml: "auto",
                        textAlign: "right",
                    }}
                >
                    {hint}
                </Typography>
            )}
        </Stack>
        {children}
    </Box>
);

export default StepSection;
