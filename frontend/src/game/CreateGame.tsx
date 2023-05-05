import React, {FC, useContext, useEffect, useState} from 'react'
import {createGameAPI, getPlayerNames} from '../api/GameAPI'
import {Button, Col, Container, Row} from "react-bootstrap";
import {AxiosError} from "axios";
import {AuthContext} from "../common/AuthContext";
import {withPlayerCondition} from "../common/withPlayerCondition";
import Select from 'react-select'
import {useNavigate} from "react-router-dom";
import {getGameTypeString, getGameVariant} from "../common/Utils";

const CreateGameComponent: FC<GameTypeProp> = ({gameVariant}) => {
    const navigate = useNavigate();
    const { player } = useContext(AuthContext);

    const [playerNames, setPlayerNames] = useState<string[]>([])

    const [eastPlayer, setEastPlayer] = useState<string | null>(null)
    const [southPlayer, setSouthPlayer] = useState<string | null>(null)
    const [westPlayer, setWestPlayer] = useState<string | null>(null)
    const [northPlayer, setNorthPlayer] = useState<string | null>(null)

    useEffect(() => {
        setWestPlayer(null)
        setSouthPlayer(null)
        setEastPlayer(null)
        setNorthPlayer(null)

        getPlayerNames(gameVariant).then((response) => {
            setPlayerNames(response.data.playerNames)
        }).catch((error: AxiosError) => {
            console.log("Error fetching player names: ", error.response?.data)
        })
    }, [gameVariant])

    const createGame = () => {
        if (playerSelectMissing || notUnique) {
            return
        }

        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        createGameAPI(player!.authToken, "RANKED", getGameVariant(gameVariant), playerList).then((response) => {
            navigate(`/games/${response.data.id}`)
        }).catch((error: AxiosError) => {
            console.log("Error creating game: ", error.response?.data)
        })
    }

    const title = `Create Ranked ${getGameTypeString(gameVariant)} Game`

    const selectOptions = playerNames.map((name) => {
        return { label: name }
    })

    const playerSelectMissing = !eastPlayer || !southPlayer || !westPlayer || !northPlayer
    const notUnique = new Set([eastPlayer, southPlayer, westPlayer, northPlayer]).size !== 4

    return (
        <Container>
            <h1 className="my-4">{title}</h1>
            <Row>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>East</h3>
                    <div className="text-start">
                        <Select options={selectOptions}
                                isSearchable
                                placeholder="Choose a Player"
                                value={!!eastPlayer ? {label: eastPlayer} : null}
                                getOptionValue={(selectOptions) => selectOptions.label}
                                onChange={e => setEastPlayer(e!.label)}/>
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>South</h3>
                    <div className="text-start">
                        <Select options={selectOptions}
                                isSearchable
                                placeholder="Choose a Player"
                                value={!!southPlayer ? {label: southPlayer} : null}
                                getOptionValue={(selectOptions) => selectOptions.label}
                                onChange={e => setSouthPlayer(e!.label)}/>
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>West</h3>
                    <div className="text-start">
                        <Select options={selectOptions}
                                isSearchable
                                placeholder="Choose a Player"
                                value={!!westPlayer ? {label: westPlayer} : null}
                                getOptionValue={(selectOptions) => selectOptions.label}
                                onChange={e => setWestPlayer(e!.label)}/>
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>North</h3>
                    <div className="text-start">
                        <Select options={selectOptions}
                                isSearchable
                                placeholder="Choose a Player"
                                value={!!northPlayer ? {label: northPlayer} : null}
                                getOptionValue={(selectOptions) => selectOptions.label}
                                onChange={e => setNorthPlayer(e!.label)}/>
                    </div>
                </Col>
            </Row>
            <Button className="my-4 mx-auto" variant="primary" disabled={playerSelectMissing || notUnique} onClick={createGame}>
                Create Game
            </Button>
        </Container>
    )
}

const hasGamePermissions = (player: Player | undefined, props: any): boolean => {
    if (props.gameVariant === "jp") {
        return typeof player !== "undefined" && player.japaneseQualified
    } else if (props.gameVariant === "hk") {
        return typeof player !== "undefined" && player.hongKongQualified
    }
    return false
}

const CreateGame = withPlayerCondition(CreateGameComponent, hasGamePermissions, '/unauthorized')

export default CreateGame;
