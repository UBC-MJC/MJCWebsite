import {FC} from "react";
import HongKongPointsInput from "./HongKongPointsInput";
import HongKongRoundActions from "./HongKongRoundActions";
import {Button, Container, Row} from "react-bootstrap";
import JapanesePointsInput from "./JapanesePointsInput";
import JapaneseRoundActions from "./JapaneseRoundActions";

type EditGameProps = {
    gameVariant: GameVariant
    players: any[]
}
const EditGame: FC<EditGameProps> = ({gameVariant, players}) => {

    const handleSubmitRound = () => {
        console.log("submit round");
    }

    const renderRoundInput = (variant: GameVariant) => {
        switch (variant) {
            case "JAPANESE":
                return <JapaneseRoundActions players={players} />
            case "HONG_KONG":
                return <HongKongRoundActions players={players}/>
        }
    }

    const renderPointsInput = (variant: GameVariant) => {
        switch (variant) {
            case "JAPANESE":
                return <JapanesePointsInput />
            case "HONG_KONG":
                return <HongKongPointsInput />
        }
    }

    return (
        <Container>
            <Container fluid="lg">
                <Row className="justify-content-center">
                    {renderRoundInput(gameVariant)}
                </Row>
            </Container>
            <div className="d-flex justify-content-center mt-4 wheel-picker-container">
                {renderPointsInput(gameVariant)}
            </div>
            <Button variant="primary" size="lg" className="mt-4" onClick={handleSubmitRound}>Submit Round</Button>
        </Container>
    )
}

export default EditGame;
