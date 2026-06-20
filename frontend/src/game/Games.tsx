import { useState } from "react";
import {
    Container,
    Divider,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { getGameVariantString } from "@/common/Utils";
import { LiveGamesSection } from "./LiveGames";
import GameLogsSection from "./GameLogs";
import type { GameVariant } from "@/types";

// Page header with the title and the shared Riichi/Hong Kong variant selector
// that drives both the live games and the game logs sections below.
const GamesHeader = ({
    variant,
    onChange,
}: {
    variant: GameVariant;
    onChange: (v: GameVariant) => void;
}) => (
    <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
    >
        <Typography variant="h1">Games</Typography>
        <ToggleButtonGroup
            exclusive
            size="medium"
            value={variant}
            onChange={(_e, v) => v && onChange(v as GameVariant)}
            aria-label="game variant"
            sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: { sm: 320 },
                "& .MuiToggleButton-root": {
                    flex: 1,
                    px: 4,
                    py: 1.25,
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    textTransform: "none",
                },
                "& .MuiToggleButtonGroup-firstButton": {
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                },
                "& .MuiToggleButtonGroup-lastButton": {
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                },
            }}
        >
            <ToggleButton value="jp">{getGameVariantString("jp")}</ToggleButton>
            <ToggleButton value="hk">{getGameVariantString("hk")}</ToggleButton>
        </ToggleButtonGroup>
    </Stack>
);

const Games = () => {
    const [gameVariant, setGameVariant] = useState<GameVariant>("jp");

    return (
        <Container maxWidth="lg">
            <Stack spacing={4}>
                <Stack spacing={3}>
                    <GamesHeader variant={gameVariant} onChange={setGameVariant} />
                    <LiveGamesSection gameVariant={gameVariant} />
                </Stack>

                <Divider />

                <GameLogsSection gameVariant={gameVariant} />
            </Stack>
        </Container>
    );
};

export default Games;
