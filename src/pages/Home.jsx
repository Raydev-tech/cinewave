import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import Footer from "../components/Footer";

import {
  getTrendingMovies,
  getPopularMovies,
  getPopularTV,
  getNowPlaying,
} from "../services/tmdb";

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchMovies() {
      try {
        const [trendingData, popularData, tvData, playingData] =
          await Promise.all([
            getTrendingMovies(),
            getPopularMovies(),
            getPopularTV(),
            getNowPlaying(),
          ]);

        if (!active) return;

        setTrending(trendingData);
        setPopular(popularData);
        setTvShows(tvData);
        setNowPlaying(playingData);
      } catch (err) {
        if (active) {
          setError(
            "Unable to load movies. Check your TMDB token and internet connection."
          );
          console.error(err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchMovies();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />

      <main>
        {loading ? (
          <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
              <p className="mt-4 text-sm text-gray-400">
                Discovering movies...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-center">
            <p className="max-w-lg text-sm leading-7 text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <Hero movie={trending[0]} />

            <div id="trending" className="pt-5">
              <MovieRow title="Trending This Week" movies={trending} />
            </div>

            <div id="movies">
              <MovieRow title="Popular Movies" movies={popular} />
            </div>

            <div id="tv-shows">
              <MovieRow title="Popular TV Shows" movies={tvShows} />
            </div>

            <MovieRow title="Now Playing" movies={nowPlaying} />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}