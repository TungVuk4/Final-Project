import axios from "axios";
import { API_BASE_URL } from "../utils/apiConfig";

const customFetch = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json"
    }
})

export default customFetch;