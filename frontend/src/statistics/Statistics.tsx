import React, { FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import Select from "react-select";
import { Col, Container, Row } from "react-bootstrap";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayers } from "../hooks/GameHooks";
import { mapPlayerNameToOption, mapSeasonToOption } from "../game/common/constants";
import { useStatistics } from "../hooks/LeaderboardHooks";

const Statistics: FC<{ gameVariant: GameVariant }> = ({ gameVariant }) => {
    const [playerId, setPlayerId] = useState<string | undefined>(
        useContext(AuthContext).player?.id,
    );
    const [season, setSeason] = useState<Season | undefined>();
    const seasonsResult = useSeasons(setSeason);
    const playersResult = usePlayers(gameVariant);

    const { isSuccess, data: stats } = useStatistics(playerId, gameVariant, season);
    if (!isSuccess || !seasonsResult.isSuccess || !playersResult.isSuccess) {
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
                        <Select
                            options={seasonsOptions}
                            isSearchable
                            placeholder="Default: This season"
                            getOptionValue={(selectOptions) => selectOptions.label}
                            onChange={(e) => setSeason(e!.value)}
                        />
                    </Col>
                    <Col>
                        <h3>Players</h3>
                        <Select
                            options={playersOptions}
                            isSearchable
                            placeholder="Default: your stats"
                            getOptionValue={(selectOptions) => selectOptions.label}
                            onChange={(e) => setPlayerId(e!.value)}
                        />
                    </Col>
                </Row>
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
                    <Col>
                        {divideWithDefault(100 * stats.winCount, stats.totalRounds).toFixed(2)}%
                    </Col>
                    <Col>Avg Agari size</Col>
                    <Col>{divideWithDefault(stats.winPoint, stats.winCount).toFixed()}</Col>
                </Row>
            </Container>
        </div>
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
