
import axios from "axios";

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    accept: "application/json",
  },
  params: {
    language: "en-US",
  },
});

export const IMAGE_URL = "https://image.tmdb.org/t/p/";

export const getTrending = (page = 1) =>
  tmdb.get("/trending/all/week", { params: { page } });

export const getPopularMovies = (page = 1) =>
  tmdb.get("/movie/popular", { params: { page } });

export const getTopRatedMovies = (page = 1) =>
  tmdb.get("/movie/top_rated", { params: { page } });

export const getUpcomingMovies = (page = 1) =>
  tmdb.get("/movie/upcoming", { params: { page } });

export const getNowPlaying = (page = 1) =>
  tmdb.get("/movie/now_playing", { params: { page } });

export const getPopularTV = (page = 1) =>
  tmdb.get("/tv/popular", { params: { page } });

export const getTopRatedTV = (page = 1) =>
  tmdb.get("/tv/top_rated", { params: { page } });

export const searchTitles = (query, page = 1) =>
  tmdb.get("/search/multi", {
    params: { query, page, include_adult: false },
  });

export const getDetails = (type, id) =>
  tmdb.get(`/${type}/${id}`, {
    params: { append_to_response: "videos,credits,recommendations" },
  });

export default tmdb;
