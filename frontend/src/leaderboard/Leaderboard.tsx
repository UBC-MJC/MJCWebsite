import type { GameCreationProp, Season, GameVariant, GameType, LeaderboardType } from "@/types";
import { palette as tokens } from "@/theme/tokens";
import { memo, useEffect, useState } from "react";
import { getGameVariantString } from "@/common/Utils";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayerLeaderboard } from "@/hooks/LeaderboardHooks";
import LoadingFallback from "@/common/LoadingFallback";
import { responsiveDataGridContainer } from "@/theme/utils";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import {
    Autocomplete,
    Box,
    Chip,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { DisplayStatistics } from "@/statistics/Statistics";

const Leaderboard = <T extends GameVariant>({ gameVariant, gameType }: GameCreationProp<T>) => {
    const [season, setSeason] = useState<Season | null>(null);
    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons();

    useEffect(() => {
        if (seasonsSuccess && seasons && seasons.length > 0) {
            const now = new Date();
            const active = seasons.find(
                (s) => new Date(s.startDate) <= now && now < new Date(s.endDate),
            );
            setSeason(active ?? seasons[0]);
        }
    }, [seasonsSuccess, seasons]);

    if (!seasonsSuccess) {
        return <LoadingFallback minHeight="50vh" message="Loading seasons…" />;
    }

    return (
        <Container>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h1" gutterBottom>
                        {getGameVariantString(gameVariant, gameType)} Leaderboard
                    </Typography>
                    {season && (
                        <Typography variant="body2" color="text.secondary">
                            Season ends{" "}
                            {new Date(season.endDate).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </Typography>
                    )}
                </Box>

                <Autocomplete
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionLabel={(o) => o.name}
                    options={seasons}
                    value={season!}
                    blurOnSelect
                    disableClearable
                    onChange={(_e, v) => setSeason(v)}
                    sx={{ maxWidth: 320 }}
                    renderInput={(params) => (
                        <TextField {...params} label="Season" placeholder="Select a season" />
                    )}
                />

                {!season ? (
                    <Typography variant="body1" color="text.secondary">
                        No season selected
                    </Typography>
                ) : (
                    <LeaderboardDisplay
                        season={season}
                        gameType={gameType}
                        gameVariant={gameVariant}
                    />
                )}
            </Stack>
        </Container>
    );
};

const MEDAL_STYLES = [tokens.medal.gold, tokens.medal.silver, tokens.medal.bronze] as const;

const rankCell = (params: { value: number }) => {
    if (params.value >= 1 && params.value <= 3) {
        const { text, bg } = MEDAL_STYLES[params.value - 1];
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        color: text,
                    }}
                >
                    {params.value}
                </Box>
            </Box>
        );
    }
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "text.secondary", fontSize: "0.85rem" }}>
            {params.value}
        </Box>
    );
};

const eloCell = (params: { value: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Typography variant="body2" fontWeight={600} fontVariantNumeric="tabular-nums">
            {params.value}
        </Typography>
    </Box>
);

const chomboCell = (params: { value: number }) =>
    params.value > 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Chip
                label={params.value}
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: "0.7rem", height: 20 }}
            />
        </Box>
    ) : (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%", color: "text.disabled" }}>
            {params.value}
        </Box>
    );

const columns: GridColDef[] = [
    {
        field: "index",
        headerName: "#",
        type: "number",
        width: 64,
        minWidth: 50,
        disableColumnMenu: true,
        renderCell: rankCell,
    },
    { field: "username", headerName: "Player", flex: 1, minWidth: 130 },
    {
        field: "displayElo",
        headerName: "Elo",
        type: "number",
        width: 100,
        minWidth: 80,
        renderCell: eloCell,
    },
    { field: "gameCount", headerName: "Games", type: "number", width: 85, minWidth: 70 },
    {
        field: "chomboCount",
        headerName: "Chombos",
        type: "number",
        width: 100,
        minWidth: 80,
        renderCell: chomboCell,
    },
];

const LeaderboardDisplay = memo(
    ({
        gameVariant,
        gameType,
        season,
    }: {
        gameVariant: GameVariant;
        gameType: GameType;
        season: Season;
    }) => {
        const { isSuccess, data: leaderboard } = usePlayerLeaderboard(gameVariant, gameType, season);
        const [player, setPlayer] = useState<LeaderboardType | undefined>(undefined);
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

        if (!isSuccess) {
            return <LoadingFallback minHeight="30vh" message="Loading leaderboard…" />;
        }

        return (
            <>
                <Box sx={responsiveDataGridContainer}>
                    <DataGrid<(typeof leaderboard)[0]>
                        rows={leaderboard}
                        columns={columns}
                        initialState={{
                            columns: {
                                columnVisibilityModel: { chomboCount: !isMobile },
                            },
                        }}
                        onRowClick={(p) => isMobile && setPlayer(p.row)}
                        onRowDoubleClick={(p) => !isMobile && setPlayer(p.row)}
                        disableColumnMenu={isMobile}
                        density={isMobile ? "compact" : "standard"}
                    />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {isMobile ? "Tap" : "Double-click"} a row to view detailed statistics
                </Typography>

                <Dialog
                    open={player !== undefined}
                    onClose={() => setPlayer(undefined)}
                    maxWidth="md"
                    fullWidth
                    keepMounted={false}
                >
                    {player && (
                        <>
                            <DialogTitle
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    pb: 1,
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <EmojiEventsIcon color="primary" fontSize="small" />
                                    <span>Statistics — {player.username}</span>
                                </Stack>
                                <IconButton
                                    edge="end"
                                    onClick={() => setPlayer(undefined)}
                                    aria-label="close"
                                    size="small"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <DisplayStatistics
                                    playerId={player.id}
                                    gameVariant={gameVariant}
                                    season={season}
                                />
                            </DialogContent>
                        </>
                    )}
                </Dialog>
            </>
        );
    },
);

LeaderboardDisplay.displayName = "LeaderboardDisplay";
export default Leaderboard;
