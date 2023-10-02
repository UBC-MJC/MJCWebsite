import { FC, useContext, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { AuthContext } from "../../common/AuthContext";
import LegacyRoundInput from "./LegacyRoundInput";
import LegacyPointsInput from "./LegacyPointsInput";
import { getLegacyRoundLabels, getPointWheels } from "../../common/Utils";
import LegacyJapaneseGameTable from "./LegacyJapaneseGameTable";

export type LegacyDisplayGameProps = {
    gameVariant: GameVariant;
    enableRecording: boolean;
    players: GamePlayer[];
    game: Game;
    handleSubmitRound: (
        roundValue: RoundValue,
        pointsValue: any,
        needPoints: boolean,
    ) => Promise<void>;
    handleDeleteRound: () => Promise<void>;
    handleSubmitGame: () => Promise<void>;
    handleDeleteGame: () => Promise<void>;
};

const LegacyDisplayGame: FC<LegacyDisplayGameProps> = ({
    gameVariant,
    enableRecording,
    players,
    game,
    handleSubmitRound,
    handleDeleteRound,
    handleSubmitGame,
    handleDeleteGame,
}) => {
    const { player } = useContext(AuthContext);
    const [roundValue, setRoundValue] = useState<RoundValue>(() => {
        const roundObject: any = {};

        roundObject.type = getLegacyRoundLabels(gameVariant)[0];

        roundObject.playerActions = {};
        players.forEach((player: any) => {
            roundObject.playerActions[player.id] = [];
        });

        return roundObject;
    });
    const [pointsValue, setPointsValue] = useState<any>(() => {
        const obj: any = {};
        getPointWheels(gameVariant).map((wheel: any) => {
            obj[wheel.value] = undefined;
        });
        return obj;
    });

    const showPointsInput = roundValue.type.selectors.includes("Winner");

    const getRecordingInterface = () => {
        return (
            <>
                <LegacyRoundInput
                    gameVariant={gameVariant}
                    players={players}
                    roundValue={roundValue}
                    onChange={setRoundValue}
                />
                {showPointsInput && (
                    <LegacyPointsInput
                        gameVariant={gameVariant}
                        pointsValue={pointsValue}
                        onChange={setPointsValue}
                    />
                )}
                <Button
                    variant="primary"
                    className="mt-4 w-50"
                    disabled={game.gameOver}
                    onClick={() => handleSubmitRound(roundValue, pointsValue, showPointsInput)}
                >
                    Submit Round
                </Button>
            </>
        );
    };

    const getLegacyGameTable = () => {
        if (gameVariant === "jp") {
            return (
                <LegacyJapaneseGameTable
                    rounds={game.rounds as JapaneseRound[]}
                    players={players}
                />
            );
        } else if (gameVariant === "hk") {
            // return (
            //     <LegacyHongKongGameTable
            //         rounds={game.rounds}
            //         players={players}
            //     />
            // )
        }
    };

    if (typeof player === "undefined") {
        return null;
    }

    return (
        <Container>
            {enableRecording && getRecordingInterface()}
            {getLegacyGameTable()}
            {enableRecording && (
                <Container>
                    <Row>
                        <Col sm>
                            <Button
                                variant="danger"
                                className="mb-2 w-100"
                                onClick={() => handleDeleteRound()}
                            >
                                Delete last Hand
                            </Button>
                        </Col>
                        <Col sm>
                            <Button
                                variant="danger"
                                className="mb-2 w-100"
                                onClick={() => handleDeleteGame()}
                            >
                                Delete Game
                            </Button>
                        </Col>
                        <Col sm>
                            <Button
                                variant="success"
                                className="mb-2 w-100"
                                disabled={!game.gameOver}
                                onClick={() => handleSubmitGame()}
                            >
                                Submit Game
                            </Button>
                        </Col>
                    </Row>
                </Container>
            )}
        </Container>
    );
};

export default LegacyDisplayGame;
