import axios from "axios";
import { baseUrl, getAuthConfig } from "./APIUtils";

interface CheckInStatus {
    checkedInAt: string | null;
}

interface CheckedInPlayer {
    id: string;
    username: string;
    checkedInAt: string;
}

const checkInAPI = async () => {
    return axios.post(baseUrl + "/checkin", {}, getAuthConfig());
};

const checkOutAPI = async () => {
    return axios.post(baseUrl + "/checkout", {}, getAuthConfig());
};

const getStatusAPI = () => {
    return axios.get<CheckInStatus>(baseUrl + "/checkin", getAuthConfig());
};

const getCheckedInPlayersAPI = () => {
    return axios.get<{ players: CheckedInPlayer[] }>(baseUrl + "/checkin/list", getAuthConfig());
};

export {
    checkInAPI,
    checkOutAPI,
    getStatusAPI,
    getCheckedInPlayersAPI,
};
