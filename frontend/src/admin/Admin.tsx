import {FC, useContext, useEffect} from "react";
import {AuthContext} from "../common/AuthContext";
import {useNavigate} from "react-router-dom";
import {checkAdmin} from "../api/AdminAPI";
import {withPlayerCondition} from "../common/withPlayerCondition";

const AdminComponent: FC = () => {
    const { player } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdmin(player!.authToken).then((response) => {
            console.log(response.data.message)
        }).catch(() => {
            navigate("/");
        })
    }, [player, navigate]);

    return (
        <div>
            <h1>Admin</h1>
        </div>
    )
}

const hasAdminPermissions = (player: IPlayer | undefined): boolean => {
    return typeof player !== "undefined" && player.admin
}

const Admin = withPlayerCondition(AdminComponent, hasAdminPermissions, '/unauthorized')

export default Admin
