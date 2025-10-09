import { Box, Grid, Typography } from "@mui/material";
import { getScoresWithPlayers } from "@/common/Utils";
import type { Game, GameVariant } from "@/types";

const GameSummaryBody = <T extends GameVariant>({
    game,
    gameVariant,
}: {
    game: Game<T>;
    gameVariant: GameVariant;
}) => {
    return (
        <Grid container spacing={1.5}>
            {getScoresWithPlayers(game, gameVariant)
                .sort((a, b) => b.score - a.score)
                .map((score, idx) => (
                    <Grid size={6} key={idx}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                py: 1,
                                px: 1.5,
                                bgcolor: idx === 0 ? "action.hover" : "background.default",
                                borderRadius: 1,
                                border: 1,
                                borderColor: idx === 0 ? "primary.main" : "divider",
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: idx === 0 ? 600 : 500,
                                    color: "text.primary",
                                }}
                            >
                                {mapIndextoPlace(idx)} - {score.username}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: idx === 0 ? 600 : 500,
                                    color: "text.primary",
                                }}
                            >
                                {score.score}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
        </Grid>
    );
};

const mapIndextoPlace = (idx: number) => {
    switch (idx) {
        case 0:
            return "1st";
        case 1:
            return "2nd";
        case 2:
            return "3rd";
        default:
            return `${idx + 1}th`;
    }
};

export default GameSummaryBody;
