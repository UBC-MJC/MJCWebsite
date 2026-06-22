import { useEffect, useRef } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    alpha,
} from "@mui/material";
import type { GamePlayer } from "@/types";

export interface RoundRow {
    id: number;
    label: string;
    deltas: number[];
}

interface RoundsTableProps {
    rows: RoundRow[];
    players: GamePlayer[];
    /** Seat index of the current dealer (East); marks that column header with 東. */
    dealerIndex?: number;
}

// Outer radius and the slightly-smaller inner radius the accent rounds into.
const RADIUS = 12;
const INNER_RADIUS = RADIUS - 1;

/** A per-round score delta: gains green, losses red, zero muted. */
const ScoreDelta = ({ value }: { value: number }) => {
    const color = value > 0 ? "success.main" : value < 0 ? "error.main" : "text.disabled";
    return (
        <Typography
            component="span"
            sx={{
                fontWeight: 600,
                fontSize: "1rem",
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
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
} as const;

const bodyCellSx = {
    py: 1.25,
    borderBottom: "1px solid",
    borderColor: "divider",
} as const;

function TableDisplay({ rows, players, dealerIndex }: RoundsTableProps) {
    const latestRowRef = useRef<HTMLTableRowElement>(null);
    const prevRowCount = useRef(rows.length);

    // Bring the most recent round into view when a new round is added (not on
    // initial mount or deletion), respecting reduced-motion preferences.
    useEffect(() => {
        if (rows.length > prevRowCount.current && latestRowRef.current) {
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            latestRowRef.current.scrollIntoView({
                block: "nearest",
                behavior: reduceMotion ? "auto" : "smooth",
            });
        }
        prevRowCount.current = rows.length;
    }, [rows.length]);

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
            <TableContainer sx={{ overflowX: "auto" }}>
                <Table
                    size="small"
                    aria-label="Round history"
                    sx={{
                        width: "100%",
                        minWidth: 460,
                        tableLayout: "fixed",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headerCellSx, textAlign: "left", width: "38%" }}>
                                Round
                            </TableCell>
                            {players.map((player, idx) => (
                                <TableCell key={player.id} align="right" sx={headerCellSx}>
                                    {idx === dealerIndex ? (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "baseline",
                                                justifyContent: "flex-end",
                                                gap: 0.5,
                                                minWidth: 0,
                                            }}
                                        >
                                            <Box
                                                component="span"
                                                aria-label="Dealer"
                                                sx={{
                                                    color: "primary.main",
                                                    fontWeight: 800,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                東
                                            </Box>
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
                                    ) : (
                                        player.username
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody
                        sx={{
                            // Subtle column dividers in the body only (not the header labels).
                            "& td:not(:last-of-type)": {
                                borderRight: "1px solid",
                                borderColor: "divider",
                            },
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
                            rows.map((row, idx) => {
                                const isLatest = idx === rows.length - 1;
                                return (
                                    <TableRow
                                        key={row.id}
                                        ref={isLatest ? latestRowRef : undefined}
                                        sx={
                                            isLatest
                                                ? {
                                                      "& td": {
                                                          bgcolor: (theme) =>
                                                              alpha(theme.palette.primary.main, 0.08),
                                                      },
                                                      // Accent stripe; round its bottom-left so it
                                                      // follows the container corner instead of being
                                                      // clipped flat.
                                                      "& td:first-of-type": {
                                                          borderLeft: "3px solid",
                                                          borderLeftColor: "primary.main",
                                                          borderBottomLeftRadius: `${INNER_RADIUS}px`,
                                                      },
                                                  }
                                                : undefined
                                        }
                                    >
                                        <TableCell sx={{ ...bodyCellSx, whiteSpace: "nowrap" }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        flexShrink: 0,
                                                        minWidth: 18,
                                                        textAlign: "center",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        color: "text.secondary",
                                                        fontVariantNumeric: "tabular-nums",
                                                    }}
                                                >
                                                    {idx + 1}
                                                </Box>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        fontSize: "1rem",
                                                        fontWeight: 600,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {row.label}
                                                </Box>
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
