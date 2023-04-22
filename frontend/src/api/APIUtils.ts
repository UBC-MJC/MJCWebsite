const baseUrl: string = "http://localhost:4000"

const getAuthConfig = (authToken: string) => {
    return {
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${authToken}`
        },
        withCredentials: true,
    }
}

export { baseUrl, getAuthConfig }
