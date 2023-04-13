import axios from "axios";

async function login(data: LoginDataType) {
    return axios.post('/login', data)
}

async function signUp(data: SignUpDataType) {
    return axios.post('/signup', data)
}

export { login, signUp }
