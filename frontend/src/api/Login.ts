import axios from "axios";

async function login(data: loginDataType) {
    return axios.post('/login', data)
}

async function signUp(data: signUpDataType) {
    return axios.post('/signup', data)
}

export { login, signUp }
