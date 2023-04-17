import React, {FC, useEffect, useState} from 'react'
import {getPlayerNames} from '../api/GameAPI'
import {Button, Col, Container, Row} from "react-bootstrap";
import PlayerSelect from "./PlayerSelect";
import {AxiosError} from "axios";

const CreateGame: FC<GameTypeProp> = ({gameType}) => {
    const [playerNames, setPlayerNames] = useState<string[]>([])

    const [eastPlayer, setEastPlayer] = useState<string | undefined>(undefined)
    const [southPlayer, setSouthPlayer] = useState<string | undefined>(undefined)
    const [westPlayer, setWestPlayer] = useState<string | undefined>(undefined)
    const [northPlayer, setNorthPlayer] = useState<string | undefined>(undefined)

    useEffect(() => {
        getPlayerNames(gameType).then((response) => {
            setPlayerNames(response.data.playerNames)
        }).catch((error: AxiosError) => {
            console.log("Error fetching player names: ", error.response?.data)
        })
    }, [gameType])

    const createGame = () => {
        console.log(eastPlayer, southPlayer, westPlayer, northPlayer)
    }

    const getGameTypeString = (gameType: "jp" | "hk"): string => {
        if (gameType === "jp") {
            return "Riichi"
        } else if (gameType === "hk") {
            return "Hong Kong"
        }
        return ""
    }

    const title = `Create Ranked ${getGameTypeString(gameType)} Game`

    const playerSelectMissing = !eastPlayer || !southPlayer || !westPlayer || !northPlayer
    const notUnique = new Set([eastPlayer, southPlayer, westPlayer, northPlayer]).size !== 4

    return (
        <Container>
            <h1 className="my-4">{title}</h1>
            <Row>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <PlayerSelect title={"East"} playerNames={playerNames} setPlayer={setEastPlayer}></PlayerSelect>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <PlayerSelect title={"South"} playerNames={playerNames} setPlayer={setSouthPlayer}></PlayerSelect>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <PlayerSelect title={"West"} playerNames={playerNames} setPlayer={setWestPlayer}></PlayerSelect>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <PlayerSelect title={"North"} playerNames={playerNames} setPlayer={setNorthPlayer}></PlayerSelect>
                </Col>
            </Row>
            <Button className="my-4 mx-auto" variant="primary" disabled={playerSelectMissing || notUnique} onClick={createGame}>
                Create Game
            </Button>
        </Container>
    )
}

export default CreateGame;
