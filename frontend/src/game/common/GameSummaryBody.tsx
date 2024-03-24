import { generateJapaneseCurrentScore } from "../jp/controller/JapaneseRound";
import { generateHongKongCurrentScore } from "../hk/controller/HongKongRound";
import { Col, Row } from "react-bootstrap";
import { FC } from "react";

type GameSummaryBodyProps = {
    game: Game;
    gameVariant: GameVariant;
};

const GameSummaryBody: FC<GameSummaryBodyProps> = ({ game, gameVariant }) => {
    const getScoresWithPlayers = () => {
        let scores: number[];
        if (gameVariant === "jp") {
            scores = generateJapaneseCurrentScore(game.rounds as JapaneseRound[]);
        } else {
            scores = generateHongKongCurrentScore(game.rounds as HongKongRound[]);
        }

        const scoresWithPlayers = scores.map((score, idx) => {
            return {
                username: game.players[idx].username,
                score: score,
            };
        });
        scoresWithPlayers.sort((a, b) => b.score - a.score);

        return scoresWithPlayers;
    };

    return (
        <Row>
            {getScoresWithPlayers().map((score, idx) => (
                <Col key={idx} xs={6} className="px-3 py-1">
                    <div className="d-flex justify-content-between">
                        <div>
                            {mapIndextoPlace(idx)} - {score.username}
                        </div>
                        <div>{score.score}</div>
                    </div>
                </Col>
            ))}
        </Row>
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
