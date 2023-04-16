import {FC, useContext, useEffect} from "react";
import {AuthContext} from "../common/AuthContext";
import {useNavigate} from "react-router-dom";
import {checkAdmin} from "../api/AdminAPI";

const Admin: FC = () => {
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (typeof authToken === "undefined") {
            navigate("/");
            return;
        }

        checkAdmin(authToken).then((response) => {
            console.log(response.data.message)
        }).catch(() => {
            navigate("/");
        })
    }, [authToken, navigate]);

    return (
        <div>
            <h1>Admin</h1>
        </div>
    )
}

export default Admin
