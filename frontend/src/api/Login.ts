import axios from "axios";
import {resolveResponse} from "./APIUtils";

async function login(username: string, password: string) {
    return resolveResponse(axios.post('/login', { username, password }))
}

export { login }
