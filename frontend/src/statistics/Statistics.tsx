import React, { FC, useContext, useEffect, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { getSeasonsAPI } from "../api/AdminAPI";
import { AxiosError } from "axios";
import { getUserStatistics } from "../api/LeaderboardAPI";
import Select from "react-select";
import { getPlayerNames } from "../api/GameAPI";
import { Col, Container, Row } from "react-bootstrap";
import { mapPlayerNameToOption, mapSeasonToOption } from "../game/common/constants";

const Statistics: FC<{ gameVariant: GameVariant }> = ({ gameVariant }) => {
    const [playerId, setPlayerId] = useState<string | undefined>(
        useContext(AuthContext).player?.id,
    );
    const [players, setPlayers] = useState<OptionsType<string>[]>([]);
    const [seasonId, setSeasonId] = useState<string | undefined>();
    const [seasons, setSeasons] = useState<OptionsType<Season>[]>([]);
    const [stats, setStats] = useState<StatisticsType>();
    useEffect(() => {
        async function init() {
            const seasonsResponse = await getSeasonsAPI();
            const allSeasons = seasonsResponse.data.pastSeasons;
            const playerNamesResponse = await getPlayerNames(gameVariant);
            setPlayers(mapPlayerNameToOption(playerNamesResponse.data));
            if (allSeasons.length > 0 && new Date(allSeasons[0].endDate) > new Date()) {
                setSeasonId(allSeasons[0].id);
            }
            setSeasons(mapSeasonToOption(allSeasons));
        }
        if (seasonId === undefined) {
            init().catch((error: AxiosError) => {
                console.error("Error fetching seasons: ", error.response?.data);
            });
        }
    }, []);

    useEffect(() => {
        async function getUserStats(seasonId: string, playerId: string | undefined) {
            if (playerId === undefined) {
                setStats({
                    dealInCount: 0,
                    dealInPoint: 0,
                    totalRounds: 0,
                    winCount: 0,
                    winPoint: 0,
                });
            } else {
                const statsResponse = await getUserStatistics(playerId, gameVariant, seasonId);
                setStats(statsResponse.data);
            }
        }
        if (seasonId !== undefined) {
            getUserStats(seasonId, playerId).catch((error: AxiosError) => {
                console.error("Error fetching seasons: ", error.response?.data);
            });
        }
    }, [seasonId, playerId]);

    if (stats === undefined) {
        return <h5 className="my-3">Loading...</h5>;
    }
    return (
        <div>
            <h1 className="my-4">Statistics</h1>
            <Container>
                <Row className="mb-4">
                    <Col>
                        <h3>Season</h3>
                        <Select
                            options={seasons}
                            isSearchable
                            defaultValue={seasons[0]}
                            getOptionValue={(selectOptions) => selectOptions.label}
                            onChange={(e) => setSeasonId(e!.value.id)}
                        />
                    </Col>
                    <Col>
                        <h3>Players</h3>
                        <Select
                            options={players}
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
