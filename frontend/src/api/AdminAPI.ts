import axios from "axios"
import {baseUrl} from "./APIUtils";

const checkAdmin = async (authToken: string) => {
    const config = {
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${authToken}`
        },
        withCredentials: true,
    }
    return axios.get(baseUrl + "/admin", config)
}

export {checkAdmin}
