import { FC } from "react";
import { Grid, Box } from "@mui/material";
import GamePlayerGridCell from "./GamePlayerGridCell";
import riichiStick from "@/assets/riichiStick.png";
import { logger } from "@/common/logger";
import type { GamePlayer } from "@/types";

interface RoundInputFigureProps {
    players: GamePlayer[];
}
const RoundInputFigure: FC<RoundInputFigureProps> = ({ players }) => {
    return (
        <Grid container justifyContent="center">
            <Grid
                size={{ xs: 12, sm: 10, md: 8, lg: 9, xl: 8 }}
                className="game-round-input"
                sx={{ p: 0 }}
            >
                <Box
                    className="game-round-input-grid"
                    sx={{ display: "flex", flexDirection: "column", p: 0 }}
                >
                    <Grid container>
                        <Grid size={{ xs: 4 }}></Grid>
                        <Grid size={{ xs: 4 }}>
                            <GamePlayerGridCell player={players[2]} />
                        </Grid>
                        <Grid size={{ xs: 4 }}></Grid>
                    </Grid>
                    <Grid container>
                        <Grid size={{ xs: 4 }}>
                            <GamePlayerGridCell player={players[3]} />
                        </Grid>
                        <Grid size={{ xs: 4 }}></Grid>
                        <Grid size={{ xs: 4 }}>
                            <GamePlayerGridCell player={players[1]} />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid size={{ xs: 4 }}></Grid>
                        <Grid size={{ xs: 4 }}>
                            <GamePlayerGridCell player={players[0]} />
                        </Grid>
                        <Grid size={{ xs: 4 }}></Grid>
                    </Grid>
                </Box>

                <Box sx={{ aspectRatio: "1/1", width: "100%" }}>
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                        <polygon
                            points="0,100 100,100 67.5,67.5 32.5,67.5"
                            onClick={() => logger.debug("bot")}
                        />
                        <polygon
                            points="100,0 100,100 67.5,67.5 67.5,32.5"
                            onClick={() => logger.debug("right")}
                        />
                        <polygon
                            points="0,0 100,0 67.5,32.5 32.5,32.5"
                            onClick={() => logger.debug("top")}
                        />
                        <polygon
                            points="0,0 0,100 32.5,67.5 32.5,32.5"
                            onClick={() => logger.debug("left")}
                        />
                        <image href={riichiStick} width={24} x={38} y={35} />
                        <image href={riichiStick} width={24} x={38} y={62} />
                        <image
                            href={riichiStick}
                            width={24}
                            x={38}
                            y={35}
                            transform="rotate(90, 50, 50)"
                        />
                        <image
                            href={riichiStick}
                            width={24}
                            x={38}
                            y={35}
                            transform="rotate(-90, 50, 50)"
                        />
                    </svg>
                </Box>
            </Grid>
        </Grid>
    );
};

export default RoundInputFigure;
