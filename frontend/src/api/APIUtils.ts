const baseUrl: string = import.meta.env.PROD ? "/api" : "http://localhost:4000/api";

const getAuthConfig = () => {
    return {
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
    };
};

export { baseUrl, getAuthConfig };
