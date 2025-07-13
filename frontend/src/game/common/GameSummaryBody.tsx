import { Col, Row } from "react-bootstrap";
import { getScoresWithPlayers } from "../../common/Utils";

const GameSummaryBody = <T extends GameVariant>({
    game,
    gameVariant,
}: {
    game: Game<T>;
    gameVariant: GameVariant;
}) => {
    return (
        <Row>
            {getScoresWithPlayers(game, gameVariant)
                .sort((a, b) => b.score - a.score)
                .map((score, idx) => (
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
