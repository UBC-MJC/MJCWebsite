import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import type { GamePlayer } from "@/types";

export interface RoundRow {
    id: number;
    /** Primary round label, e.g. "東二局". */
    label: string;
    /** Optional muted suffix shown smaller after the label, e.g. "0本場". */
    secondary?: string;
    deltas: number[];
}

interface RoundsTableProps {
    rows: RoundRow[];
    players: GamePlayer[];
    /** Seat index of the current dealer (East); marks that column header with 東. */
    dealerIndex?: number;
}

// Outer corner radius of the table container.
const RADIUS = 12;

// Seat winds, in rotation order starting from the dealer (East).
const WIND_CHARS = ["東", "南", "西", "北"] as const;

/** A per-round score delta: gains green, losses red, zero muted. */
const ScoreDelta = ({ value }: { value: number }) => {
    const color = value > 0 ? "success.main" : value < 0 ? "error.main" : "text.disabled";
    return (
        <Typography
            component="span"
            sx={{
                fontWeight: 800,
                // Scale the figures down on narrow viewports so large deltas
                // (e.g. +48,000) stay inside their column instead of spilling out.
                fontSize: { xs: "0.75rem", sm: "1rem" },
                fontVariantNumeric: "tabular-nums",
                color,
            }}
        >
            {value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString()}
        </Typography>
    );
};

const headerCellSx = {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "text.secondary",
    bgcolor: "action.hover",
    borderBottom: "1px solid",
    borderColor: "divider",
    py: 1.25,
    px: { xs: 1, sm: 1.5 },
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
} as const;

const bodyCellSx = {
    py: 1.25,
    px: { xs: 1, sm: 1.5 },
    borderBottom: "1px solid",
    borderColor: "divider",
    // Clip any content that can't fit the fixed-width cell so nothing escapes
    // the table on narrow screens.
    overflow: "hidden",
    textOverflow: "ellipsis",
} as const;

// The Round column is narrow; trim its horizontal padding so the round number
// isn't pushed away from the left edge by excess whitespace.
const roundCellPx = { xs: 0.5, sm: 0.75 } as const;

function TableDisplay({ rows, players, dealerIndex }: RoundsTableProps) {
    return (
        <Box
            sx={{
                width: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: `${RADIUS}px`,
                overflow: "hidden",
            }}
        >
            <TableContainer>
                <Table
                    size="small"
                    aria-label="Round history"
                    sx={{
                        width: "100%",
                        tableLayout: "fixed",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    ...headerCellSx,
                                    textAlign: "center",
                                    width: "22%",
                                    px: roundCellPx,
                                }}
                            >
                                Round
                            </TableCell>
                            {players.map((player, idx) => {
                                const isDealer = idx === dealerIndex;
                                const wind =
                                    dealerIndex !== undefined
                                        ? WIND_CHARS[
                                              (idx - dealerIndex + players.length) % players.length
                                          ]
                                        : undefined;
                                return (
                                    <TableCell key={player.id} align="center" sx={headerCellSx}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "baseline",
                                                justifyContent: "center",
                                                gap: 0.5,
                                                minWidth: 0,
                                            }}
                                        >
                                            {wind !== undefined && (
                                                <Box
                                                    component="span"
                                                    aria-label={isDealer ? "Dealer" : undefined}
                                                    sx={{
                                                        // Dealer wind keeps the accent; the other
                                                        // seats are muted so the dealer stands out.
                                                        color: isDealer
                                                            ? "primary.main"
                                                            : "text.disabled",
                                                        fontWeight: isDealer ? 800 : 600,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {wind}
                                                </Box>
                                            )}
                                            <Box
                                                component="span"
                                                sx={{
                                                    minWidth: 0,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {player.username}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody
                        sx={{
                            "& tr:last-of-type td": { borderBottom: "none" },
                        }}
                    >
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={players.length + 1}
                                    sx={{
                                        textAlign: "center",
                                        color: "text.secondary",
                                        py: 3,
                                        borderBottom: "none",
                                    }}
                                >
                                    No rounds yet
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => {
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ ...bodyCellSx, px: roundCellPx }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "baseline",
                                                    justifyContent: "center",
                                                    gap: 0.75,
                                                    minWidth: 0,
                                                    // Keep the whole label on a single line; the
                                                    // pieces below shrink/ellipsis rather than
                                                    // wrapping onto a second row.
                                                    flexWrap: "nowrap",
                                                }}
                                            >
                                            <Box
                                                component="span"
                                                sx={{
                                                    // Round text is the top priority: it never
                                                    // shrinks or truncates, so it always stays
                                                    // fully visible ahead of every other element.
                                                    flexShrink: 0,
                                                    fontSize: {
                                                        xs: "0.8125rem",
                                                        sm: "0.9375rem",
                                                    },
                                                    fontWeight: 600,
                                                    lineHeight: 1.2,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {row.label}
                                            </Box>
                                            {row.secondary !== undefined && (
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        // Bonus is secondary: smaller and more
                                                        // muted than the round, and the first to
                                                        // truncate when space runs out.
                                                        minWidth: 0,
                                                        flexShrink: 0,
                                                        fontSize: {
                                                            xs: "0.625rem",
                                                            sm: "0.75rem",
                                                        },
                                                        fontWeight: 500,
                                                        lineHeight: 1.2,
                                                        color: "text.disabled",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {row.secondary}
                                                </Box>
                                            )}
                                            </Box>
                                        </TableCell>
                                        {row.deltas.map((delta, i) => (
                                            <TableCell key={i} align="right" sx={bodyCellSx}>
                                                <ScoreDelta value={delta} />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default TableDisplay;
