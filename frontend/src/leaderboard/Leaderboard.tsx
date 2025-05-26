import React, { FC, useState } from "react";
import { getGameVariantString } from "../common/Utils";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayerLeaderboard } from "../hooks/LeaderboardHooks";
import { mapSeasonToOption } from "../game/common/constants";
import {
    Autocomplete,
    TextField,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
} from "@mui/material";

const Leaderboard: FC<GameCreationProp> = ({ gameVariant, gameType }) => {
    const [season, setSeason] = useState<Season | undefined>();

    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons(setSeason);

    if (!seasonsSuccess) {
        return <Typography variant="h5">Loading...</Typography>;
    }
    const seasonsOptions = mapSeasonToOption(seasons);
    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                {getGameVariantString(gameVariant, gameType)} Leaderboard
            </Typography>

            <Box mb={3}>
                <Typography variant="h6" component="span">
                    Season:
                </Typography>
                <Autocomplete
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    options={seasonsOptions}
                    onChange={(event, value) => setSeason(value?.value)}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Default: this season" size="small" />
                    )}
                />
            </Box>

            {season === undefined ? (
                <Typography variant="h6">No season selected</Typography>
            ) : (
                <LeaderboardDisplay season={season} gameType={gameType} gameVariant={gameVariant} />
            )}
        </Container>
    );
};

const LeaderboardDisplay: FC<{ gameVariant: GameVariant; gameType: GameType; season: Season }> = ({
    gameVariant,
    gameType,
    season,
}) => {
    const { isSuccess, data: leaderboard } = usePlayerLeaderboard(gameVariant, gameType, season);
    if (!isSuccess) {
        return <Typography variant="h5">Loading ...</Typography>;
    }
    return (
        <>
            <Typography variant="h6" gutterBottom>
                {season.name} season ends {new Date(season.endDate).toDateString()}
            </Typography>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Player</TableCell>
                            <TableCell>ELO</TableCell>
                            <TableCell>Games</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaderboard.map((player, index) => (
                            <TableRow key={player.username}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{player.username}</TableCell>
                                <TableCell>{player.elo}</TableCell>
                                <TableCell>{player.gameCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};
export default Leaderboard;
