import type { GameCreationProp, Season, GameVariant, GameType, LeaderboardType } from "@/types";

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
import { DisplayStatistics } from "@/statistics/Statistics";

const Leaderboard = ({ gameVariant, gameType }: GameCreationProp) => {
    const [season, setSeason] = useState<Season | null>(null);
    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons();

    useEffect(() => {
        // Set the currently active season, or fallback to the most recent season
        if (seasonsSuccess && seasons && seasons.length > 0) {
            const now = new Date();
            const activeSeason = seasons.find(
                (s) => new Date(s.startDate) <= now && now < new Date(s.endDate),
            );
            setSeason(activeSeason ?? seasons[0]);
        }
    }, [seasonsSuccess, seasons]);

    if (!seasonsSuccess) {
        return <LoadingFallback minHeight="50vh" message="Loading seasons..." />;
    }
    return (
        <Container>
            <Stack>
                <Typography variant="h1">
                    {getGameVariantString(gameVariant, gameType)} Leaderboard
                </Typography>

                <Autocomplete
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => option.name}
                    options={seasons}
                    value={season}
                    blurOnSelect
                    onChange={(_e, value) => setSeason(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Season" placeholder="Select season" />
                    )}
                />

                {!season ? (
                    <Typography variant="body1">No season selected</Typography>
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
    ({
        gameVariant,
        gameType,
        season,
    }: {
        gameVariant: GameVariant;
        gameType: GameType;
        season: Season;
    }) => {
        const { isSuccess, data: leaderboard } = usePlayerLeaderboard(
            gameVariant,
            gameType,
            season,
        );
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
                <Box sx={responsiveDataGridContainer}>
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
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
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
