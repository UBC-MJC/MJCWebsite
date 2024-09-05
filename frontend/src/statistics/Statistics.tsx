import React, { FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { Col, Container, Row } from "react-bootstrap";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayers } from "../hooks/GameHooks";
import { mapPlayerNameToOption, mapSeasonToOption } from "../game/common/constants";
import { useStatistics } from "../hooks/LeaderboardHooks";
import { Autocomplete, TextField } from "@mui/material";

const Statistics: FC<{ gameVariant: GameVariant }> = ({ gameVariant }) => {
    const [playerId, setPlayerId] = useState<string | undefined>(
        useContext(AuthContext).player?.id,
    );
    const [season, setSeason] = useState<Season | undefined>();
    const seasonsResult = useSeasons(setSeason);
    const playersResult = usePlayers(gameVariant, "CASUAL");

    if (!seasonsResult.isSuccess || !playersResult.isSuccess) {
        return <>Loading ...</>;
    }
    const seasonsOptions = mapSeasonToOption(seasonsResult.data);
    const playersOptions = mapPlayerNameToOption(playersResult.data);
    return (
        <div>
            <h1 className="my-4">Statistics</h1>
            <Container>
                <Row className="mb-4">
                    <Col>
                        <h3>Season</h3>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={seasonsOptions}
                            onChange={(event, value) => setSeason(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Default: this season" />
                            )}
                        />
                    </Col>
                    <Col>
                        <h3>Players</h3>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={playersOptions}
                            onChange={(event, value) => setPlayerId(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Default: your stats" />
                            )}
                        />
                    </Col>
                </Row>
                <DisplayStatistics playerId={playerId} gameVariant={gameVariant} season={season} />
            </Container>
        </div>
    );
};

const DisplayStatistics: FC<{
    playerId: string | undefined;
    gameVariant: GameVariant;
    season: Season | undefined;
}> = ({ playerId, gameVariant, season }) => {
    const { isSuccess, data: stats } = useStatistics(playerId, gameVariant, season);
    if (!isSuccess) {
        return <>Loading ...</>;
    }
    return (
        <>
            <Row className="mb-4">
                <Col>Deal-in %</Col>
                <Col>
                    {divideWithDefault(100 * stats.dealInCount, stats.totalRounds).toFixed(2)}%
                </Col>
                <Col>Avg Deal-in size</Col>
                <Col>{divideWithDefault(stats.dealInPoint, stats.dealInCount).toFixed(0)}</Col>
            </Row>
            <Row className="mb-4">
                <Col>Agari %</Col>
                <Col>{divideWithDefault(100 * stats.winCount, stats.totalRounds).toFixed(2)}%</Col>
                <Col>Avg Agari size</Col>
                <Col>{divideWithDefault(stats.winPoint, stats.winCount).toFixed()}</Col>
            </Row>
        </>
    );
};
function divideWithDefault(numerator: number, denominator: number, defaultValue = 0) {
    const result = numerator / denominator;
    if (isNaN(result)) {
        return defaultValue;
    }
    return result;
}

export default Statistics;
