import {FC, useContext, useEffect, useState} from "react";
import {AuthContext} from "../common/AuthContext";
import {AxiosError} from "axios";
import {getPlayersAdmin} from "../api/AdminAPI";
import {Table} from "react-bootstrap";
import AdminPlayerRow from "./AdminPlayerRow";

const AdminPlayers: FC = () => {
    const { player } = useContext(AuthContext)

    const [players, setPlayers] = useState<IPlayer[]>([])

    useEffect(() => {
        getPlayersAdmin(player!.authToken).then((response) => {
            setPlayers(response.data.players)
        }).catch((error: AxiosError) => {
            console.log("Error fetching players: ", error.response?.data)
        })
    }, [player])

    return (
        <Table striped bordered hover responsive className="my-4">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Qualified Japanese</th>
                    <th>Qualified Hong Kong</th>
                </tr>
            </thead>
            <tbody>
                {players.map((player) => <AdminPlayerRow key={player.id} player={player} />)}
            </tbody>
        </Table>
    );
}

export default AdminPlayers