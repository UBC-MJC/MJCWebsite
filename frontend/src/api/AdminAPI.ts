import axios from "axios"
import {baseUrl, getAuthConfig} from "./APIUtils";

const checkAdmin = async (authToken: string) => {
    return axios.get(baseUrl + "/admin", getAuthConfig(authToken))
}

export {checkAdmin}
