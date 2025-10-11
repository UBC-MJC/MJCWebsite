import { FC, useState } from "react";
import { hongKongRoundLabels, japaneseRoundLabels } from "@/common/Utils";
import { Container, Grid, ToggleButton, ToggleButtonGroup } from "@mui/material";
import RoundInputFigure from "./RoundInputFigure";
import type { GameVariant, GamePlayer, RoundValue, RoundType } from "@/types";

interface RoundInputProps {
    gameVariant: GameVariant;
    players: GamePlayer[];
    roundValue: RoundValue;
    onChange: (value: RoundValue) => void;
    isLegacy?: boolean;
}

const NewRoundInput: FC<RoundInputProps> = ({ gameVariant, players }) => {
    const [roundValue, setRoundValue] = useState<string>(() => {
        switch (gameVariant) {
            case "jp":
                return japaneseRoundLabels[0].value;
            case "hk":
                return hongKongRoundLabels[0].value;
        }
    });

    const getRoundLabels = () => {
        switch (gameVariant) {
            case "jp":
                return japaneseRoundLabels;
            case "hk":
                return hongKongRoundLabels;
        }
    };

    return (
        <Container maxWidth="lg">
            <Grid container justifyContent="center">
                <Grid
                    size={{ xs: 12, lg: 4 }}
                    sx={{ display: "flex", justifyContent: "center", flexDirection: "column" }}
                >
                    <ToggleButtonGroup
                        orientation="vertical"
                        value={roundValue}
                        exclusive
                        onChange={(e, newValue) => newValue && setRoundValue(newValue)}
                        sx={{ mt: 1 }}
                    >
                        {getRoundLabels().map((label: RoundType, idx: number) => (
                            <ToggleButton
                                key={idx}
                                value={label.value}
                                sx={{ my: 0.5, width: "100%" }}
                            >
                                {label.name}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <RoundInputFigure players={players} />
                </Grid>
            </Grid>
        </Container>
    );
};
