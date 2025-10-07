const baseUrl: string =
    process.env.NODE_ENV === "production" ? "/api" : "http://localhost:4000/api";

const getAuthConfig = () => {
    return {
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
    };
};

export { baseUrl, getAuthConfig };
