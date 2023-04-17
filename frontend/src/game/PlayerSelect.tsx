import {FC} from "react";
import {Form} from "react-bootstrap";


interface PlayerSelectProps {
    title: string
    playerNames: string[]
    setPlayer: (playerName: string) => void
}

const PlayerSelect: FC<PlayerSelectProps> = ({title, playerNames, setPlayer}) => {
    return (
        <>
            <h3>{title}</h3>
            <Form.Select size="lg"
                         defaultValue="default"
                         onChange={(e) => setPlayer(e.target.value)}>
                <option value="default" disabled>Choose a Player</option>
                {playerNames.map((name, index) => {
                    return <option key={index} value={name}>{name}</option>
                })}
            </Form.Select>
        </>
    )
}

export default PlayerSelect;
