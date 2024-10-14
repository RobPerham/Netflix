import axios from "axios";

const instance = axios.create({
  baseURL: "https://api.themoviedb.org/3", // Replace with the correct base URL
});

export default instance;
