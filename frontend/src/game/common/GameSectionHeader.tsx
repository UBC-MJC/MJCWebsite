import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

// Shared header row for the Games page sections (live games / logs): an h1
// title on the left and an optional control on the right, stacking on mobile.
// Pass `onClick` to make the whole row a toggle (e.g. collapsible logs).
const GameSectionHeader = ({
    title,
    onClick,
    children,
}: {
    title: string;
    onClick?: () => void;
    children?: ReactNode;
}) => (
    <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        onClick={onClick}
        sx={onClick ? { cursor: "pointer", userSelect: "none" } : undefined}
    >
        <Typography variant="h1">{title}</Typography>
        {children}
    </Stack>
);

export default GameSectionHeader;
