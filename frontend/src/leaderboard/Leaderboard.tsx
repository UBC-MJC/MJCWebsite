import type { GameVariantProp, Season, GameVariant, LeaderboardType } from "@/types";

import { memo, useState } from "react";
import { getGameVariantString } from "@/common/Utils";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayerLeaderboard } from "@/hooks/LeaderboardHooks";
import LoadingFallback from "@/common/LoadingFallback";
import { responsiveDataGridContainer } from "@/theme/utils";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import {
    Autocomplete,
    Box,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DisplayStatistics } from "@/statistics/Statistics";

const Leaderboard = <T extends GameVariant>({ gameVariant }: GameVariantProp<T>) => {
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>();
    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons();

    if (!seasonsSuccess) {
        return <LoadingFallback minHeight="50vh" message="Loading seasons..." />;
    }
    const now = new Date();
    const defaultSeason =
        seasons.find((candidate) => candidate.startDate <= now && now < candidate.endDate) ??
        seasons[0];
    const season =
        seasons.find((candidate) => candidate.id === selectedSeasonId) ?? defaultSeason ?? null;
    return (
        <Container>
            <Typography variant="h1">
                {getGameVariantString(gameVariant, season?.type)} Leaderboard
            </Typography>

            <Autocomplete
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => `${option.name} (${option.type.replace("_", " ")})`}
                options={seasons}
                value={season!}
                blurOnSelect
                disableClearable
                onChange={(_e, value) => setSelectedSeasonId(value.id)}
                renderInput={(params) => (
                    <TextField {...params} label="Season" placeholder="Select a season" />
                )}
            />

            {!season ? (
                <Typography variant="body1">No season selected</Typography>
            ) : (
                <LeaderboardDisplay season={season} gameVariant={gameVariant} />
            )}
        </Container>
    );
};

const columns: GridColDef[] = [
    {
        field: "index",
        headerName: "#",
        type: "number",
        width: 60,
        minWidth: 50,
        disableColumnMenu: true,
    },
    {
        field: "username",
        headerName: "Player",
        flex: 1,
        minWidth: 120,
    },
    {
        field: "displayElo",
        headerName: "Elo",
        type: "number",
        width: 90,
        minWidth: 80,
    },
    {
        field: "gameCount",
        headerName: "Games",
        type: "number",
        width: 80,
        minWidth: 70,
    },
    {
        field: "chomboCount",
        headerName: "Chombos",
        type: "number",
        width: 90,
        minWidth: 80,
    },
];
const LeaderboardDisplay = memo(
    ({ gameVariant, season }: { gameVariant: GameVariant; season: Season }) => {
        const { isSuccess, data: leaderboard } = usePlayerLeaderboard(gameVariant, season);
        const [player, setPlayer] = useState<LeaderboardType | undefined>(undefined);
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

        if (!isSuccess) {
            return <LoadingFallback minHeight="30vh" message="Loading leaderboard..." />;
        }

        return (
            <>
                <Typography variant="body1" color="text.secondary">
                    {season.name} ends {new Date(season.endDate).toDateString()}
                </Typography>
                <Box {...responsiveDataGridContainer}>
                    <DataGrid<(typeof leaderboard)[0]>
                        rows={leaderboard}
                        columns={columns}
                        initialState={{
                            columns: {
                                columnVisibilityModel: {
                                    chomboCount: !isMobile,
                                },
                            },
                        }}
                        onRowClick={(params) => isMobile && setPlayer(params.row)}
                        onRowDoubleClick={(params) => !isMobile && setPlayer(params.row)}
                        sx={{
                            "& .MuiDataGrid-cell": {
                                cursor: "pointer",
                            },
                            "& .MuiDataGrid-row:hover": {
                                backgroundColor: theme.palette.action.hover,
                            },
                        }}
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
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                Statistics for {player.username}
                                <IconButton
                                    edge="end"
                                    color="inherit"
                                    onClick={() => setPlayer(undefined)}
                                    aria-label="close"
                                >
                                    <CloseIcon />
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
