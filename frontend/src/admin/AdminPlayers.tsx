import {FC, useContext, useEffect, useState} from "react";
import {AuthContext} from "../common/AuthContext";
import {AxiosError} from "axios";
import {useNavigate} from "react-router-dom";
import {getPlayersAdmin} from "../api/AdminAPI";
import {Table} from "react-bootstrap";
import AdminPlayerRow from "./AdminPlayerRow";

const AdminPlayers: FC = () => {
    const { player } = useContext(AuthContext)

    const navigate = useNavigate();

    const [players, setPlayers] = useState<IPlayer[]>([])

    useEffect(() => {
        if (typeof player === "undefined") {
            navigate("/unauthorized");
            return
        }

        getPlayersAdmin(player.authToken).then((response) => {
            setPlayers(response.data.players)
        }).catch((error: AxiosError) => {
            console.log("Error fetching players: ", error.response?.data)
        })
    }, [])

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