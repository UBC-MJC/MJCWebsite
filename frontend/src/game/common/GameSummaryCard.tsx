import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    Chip,
    Typography,
    Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GameSummaryBody from "./GameSummaryBody";
import { getGameVariantString } from "@/common/Utils";
import type { GameVariant, Game } from "@/types";
import { responsiveCardHover } from "@/theme/utils";
import { pulse } from "@/theme/animations";

// Shared responsive grid for laying out GameSummaryCards. Snaps to two (or
// more) columns when the container is wide enough for another ≥360px card,
// otherwise falls back to a single column — driven by available width, not
// viewport breakpoints.
export const gameSummaryGrid = {
    display: "grid",
    gap: 3,
    // Cap the layout at two cards per row: a single column on narrow
    // screens, two equal columns once there's room.
    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
} as const;

// Shared header text sizing — identical across both variants. Text scales
// with the card's own width (cqi units) and truncates as a last resort, so
// nothing is ever clipped off.
const TITLE_FONT_SIZE = "clamp(0.8rem, 4cqi, 1.25rem)";
const TIME_ICON_FONT_SIZE = "1rem";
const TIME_FONT_SIZE = "clamp(0.65rem, 2.4cqi, 0.7rem)";

// Per-variant differences: whether the live pulse dot is shown and the scale
// of the round/type chip.
const VARIANT_STYLES = {
    live: {
        liveIndicator: true,
        chipHeight: 30,
        chipFontSize: "clamp(0.72rem, 3cqi, 1rem)",
        chipTabularNums: true,
    },
    log: {
        liveIndicator: false,
        chipHeight: 45,
        chipFontSize: "clamp(0.85rem, 3.5cqi, 1.1rem)",
        chipTabularNums: false,
    },
} as const;

interface GameSummaryCardProps<T extends GameVariant> {
    game: Game<T>;
    gameVariant: T;
    variant: "live" | "log";
    chipLabel: React.ReactNode;
    timeText: React.ReactNode;
}

const GameSummaryCard = <T extends GameVariant>({
    game,
    gameVariant,
    variant,
    chipLabel,
    timeText,
}: GameSummaryCardProps<T>) => {
    const s = VARIANT_STYLES[variant];

    return (
        <Card
            sx={{
                display: "flex",
                flexDirection: "column",
                // Establish a container so header text can scale with the
                // card's width (cqi units), not the viewport.
                containerType: "inline-size",
                ...responsiveCardHover,
                // Keep the gradient/shadow/border hover effects
                // but remove the upward lift (translateY).
                "&:hover": {
                    transform: "none",
                    boxShadow: { xs: "none", sm: "var(--mui-palette-appShadow-card)" },
                    borderColor: "primary.light",
                    "&::after": { transform: "scaleX(1)" },
                },
            }}
        >
            <CardActionArea
                component={Link}
                to={`/games/${gameVariant}/${game.id}`}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    flexGrow: 1,
                }}
            >
                <CardHeader
                    title={
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "nowrap",
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    minWidth: 0,
                                }}
                            >
                                {s.liveIndicator && (
                                    <Box
                                        sx={{
                                            width: 9,
                                            height: 9,
                                            borderRadius: "50%",
                                            bgcolor: "primary.main",
                                            flexShrink: 0,
                                            animation: `${pulse} 1.6s ease-in-out infinite`,
                                            "@media (prefers-reduced-motion: reduce)": {
                                                animation: "none",
                                            },
                                        }}
                                    />
                                )}
                                <Typography
                                    variant="h6"
                                    component="div"
                                    noWrap
                                    sx={{
                                        fontSize: TITLE_FONT_SIZE,
                                        fontWeight: 700,
                                        minWidth: 0,
                                    }}
                                >
                                    {getGameVariantString(gameVariant, game.type)} #{game.id}
                                </Typography>
                                <Tooltip title={new Date(game.createdAt).toLocaleString()} arrow>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            color: "text.secondary",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <AccessTimeIcon sx={{ fontSize: TIME_ICON_FONT_SIZE }} />
                                        <Typography
                                            variant="body2"
                                            sx={{ whiteSpace: "nowrap", fontSize: TIME_FONT_SIZE }}
                                        >
                                            {timeText}
                                        </Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                            <Chip
                                label={chipLabel}
                                size="medium"
                                variant="filled"
                                sx={{
                                    height: s.chipHeight,
                                    flexShrink: 0,
                                    fontSize: s.chipFontSize,
                                    fontWeight: 600,
                                    letterSpacing: "0.04em",
                                    ...(s.chipTabularNums && { fontVariantNumeric: "tabular-nums" }),
                                    border: "none",
                                    bgcolor: "var(--mui-palette-accentTint-row)",
                                    color: "primary.light",
                                    "& .MuiChip-label": { px: { xs: 1, sm: 1.75 } },
                                }}
                            />
                        </Box>
                    }
                    sx={{
                        bgcolor: "action.hover",
                        // Allow the title content to shrink below its intrinsic
                        // width so it never pushes the chip off the right edge.
                        "& .MuiCardHeader-content": {
                            minWidth: 0,
                            overflow: "hidden",
                        },
                    }}
                />
                <CardContent
                    sx={{
                        flexGrow: 1,
                        px: 1,
                        pt: 1,
                        "&:last-child": { pb: 1 },
                    }}
                >
                    <GameSummaryBody game={game} gameVariant={gameVariant} />
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default GameSummaryCard;
