import axios, { AxiosResponse } from "axios"

const baseUrl: string = "http://localhost:4000"

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message
    return String(error)
}

export const getGames = async (): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const games: AxiosResponse<ApiDataType> = await axios.get(
            baseUrl + "/games"
        )
        return games
    } catch (error) {
        throw new Error(getErrorMessage(error))
    }
}

export const addGame = async (): Promise<AxiosResponse<ApiDataType>> => {
    try {
        const addGame: AxiosResponse<ApiDataType> = await axios.post(
            baseUrl + "/add-game"
        )
        return addGame
    } catch (error) {
        throw new Error(getErrorMessage(error))
    }
}
