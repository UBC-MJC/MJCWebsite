import axios from "axios"
import {baseUrl, getAuthConfig} from "./APIUtils";

const getPlayersAdmin = async (authToken: string) => {
    return axios.get(baseUrl + "/admin/players", getAuthConfig(authToken))
}

export {getPlayersAdmin}
