import {AxiosResponse} from "axios";

const baseUrl: string = "http://localhost:4000"

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message
    return String(error)
}

async function resolveResponse(response: Promise<AxiosResponse>) {
    try {
        return await response
    } catch (error) {
        throw new Error(getErrorMessage(error))
    }
}

export { baseUrl, getErrorMessage, resolveResponse }
