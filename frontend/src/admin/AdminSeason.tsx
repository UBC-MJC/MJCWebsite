import {FC, useContext, useEffect, useState} from "react";
import {AuthContext} from "../common/AuthContext";
import {createSeasonAdminAPI, getSeasonsAdminAPI} from "../api/AdminAPI";
import {AxiosError} from "axios";
import {Table, Button, Modal, Form} from "react-bootstrap";
import AdminSeasonRow from "./AdminSeasonRow";

const AdminSeason: FC = () => {
    const { player } = useContext(AuthContext)

    const [currentSeason, setCurrentSeason] = useState<Season | undefined>(undefined)
    const [pastSeasons, setPastSeasons] = useState<Season[]>([])
    const [show, setShow] = useState<boolean>(false)

    useEffect(() => {
        getSeasonsAdminAPI(player!.authToken).then((response) => {
            setCurrentSeason(response.data.currentSeason)
            setPastSeasons(response.data.pastSeasons)
        }).catch((error: AxiosError) => {
            console.log("Error fetching seasons: ", error.response?.data)
        })
    }, [player, currentSeason])

    const handleShow = () => setShow(true)
    const handleClose = () => setShow(false)
    const handleCreate = () => {
        setShow(false)
        setCurrentSeason({
            id: -1,
            name: "",
            startDate: "",
            endDate: ""
        })
    }

    return (
        <>
            <div>
                <h2>Current Season</h2>
                <div>
                    {currentSeason ? (
                        <Table striped bordered hover responsive className="my-4">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AdminSeasonRow key={currentSeason.id} season={currentSeason} />
                            </tbody>
                        </Table>
                    ) : (
                        <>
                            <p>No current season</p>
                            <Button variant="primary" onClick={handleShow}>
                                Create Season
                            </Button>
                            <StartSeasonModal show={show} handleClose={handleClose} handleCreate={handleCreate}/>
                        </>
                    )}
                </div>
            </div>
            <div>
                <h2>Past Seasons</h2>
                <Table striped bordered hover responsive className="my-4">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pastSeasons.map((season) => <AdminSeasonRow key={season.id} season={season} />)}
                    </tbody>
                </Table>
            </div>
        </>
    );
}


type StartSeasonModalProps = {
    show: boolean
    handleClose: () => void
    handleCreate: () => void
}
const StartSeasonModal: FC<StartSeasonModalProps> = ({show, handleClose, handleCreate}) => {
    const { player } = useContext(AuthContext)

    const [seasonName, setSeasonName] = useState('');

    const startSeason = () => {
        createSeasonAdminAPI(player!.authToken, seasonName).then((response) => {
            handleCreate()
            console.log("Created season: ", seasonName)
        }).catch((error: AxiosError) => {
            console.log("Error creating season: ", error.response?.data)
        })
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Create Season</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Control size="lg" type="text" placeholder="Season Name" onChange={(e) => setSeasonName(e.target.value)}/>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={startSeason}>Start Season</Button>
            </Modal.Footer>
        </Modal>
    );
}


export default AdminSeason
