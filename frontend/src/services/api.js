import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  withCredentials: true, // cookies auth
});

export default API;