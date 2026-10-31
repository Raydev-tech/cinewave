
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useParams,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Menu,
  X,
  Bookmark,
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  Film,
  Tv,
  Home,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import {
  IMAGE_URL,
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlaying,
  getPopularTV,
  getTopRatedTV,
  searchTitles,
  getDetails,
} from "./services/tmdb";

import "./index.css";

const getTitle = (item) => item.title || item.name || "Untitled";

const getYear = (item) => {
  const date = item.release_date || item.first_air_date;
  return date ? date.slice(0, 4) : "N/A";
};

function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cinewave-watchlist") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cinewave-watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (item, type) => {
    setWatchlist((current) => {
      const exists = current.some(
        (saved) => saved.id === item.id && saved.media_type === type
      );

      if (exists) {
        return current.filter(
          (saved) =>
            !(saved.id === item.id && saved.media_type === type)
        );
      }

      return [...current, { ...item, media_type: type }];
    });
  };

  return { watchlist, toggleWatchlist };
}

const WatchlistContext = {
  value: null,
};

function Loading() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="py-20 text-center text-gray-400">
      <p className="text-lg">{message}</p>
      <p className="mt-2 text-sm">Check your TMDB API connection and try again.</p>
    </div>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/tv-shows", label: "TV Shows", icon: Tv },
    { to: "/watchlist", label: "Watchlist", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090d]/95 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="text-2xl font-black tracking-tight">
          <span className="text-red-500">CINE</span>
          <span className="text-white">WAVE</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-red-500" : "text-gray-400 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/search")}
            aria-label="Search"
            className="rounded-full border border-white/10 p-2.5 text-gray-300 hover:bg-white/10"
          >
            <Search size={19} />
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            className="rounded-lg p-2 text-white md:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#101117] px-5 py-4 md:hidden">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-gray-300 hover:text-red-500"
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              navigate("/search");
            }}
            className="flex items-center gap-2 py-3 text-gray-300"
          >
            <Search size={17} /> Search
          </button>
        </div>
      )}
    </header>
  );
}

function MovieCard({ item, type, onToggle, saved = false }) {
  const mediaType = type || item.media_type || "movie";
  const title = getTitle(item);

  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#14151c]"
    >
      <Link to={`/details/${mediaType}/${item.id}`}>
        <div className="aspect-[2/3] overflow-hidden bg-[#20212a]">
          {item.poster_path ? (
            <img
              src={`${IMAGE_URL}w500${item.poster_path}`}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No poster
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={() => onToggle?.(item, mediaType)}
        aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
        className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white backdrop-blur hover:bg-red-500"
      >
        {saved ? <Bookmark fill="currentColor" size={17} /> : <Bookmark size={17} />}
      </button>

      <div className="p-3">
        <Link
          to={`/details/${mediaType}/${item.id}`}
          className="line-clamp-1 font-semibold text-white hover:text-red-400"
        >
          {title}
        </Link>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>{getYear(item)}</span>
          <span className="flex items-center gap-1 text-yellow-400">
            <Star size={13} fill="currentColor" />
            {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function Section({ title, items = [], type, onToggle, watchlist = [] }) {
  if (!items.length) return null;

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white md:text-2xl">{title}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => {
          const mediaType = type || item.media_type || "movie";
          const saved = watchlist.some(
            (entry) =>
              entry.id === item.id && entry.media_type === mediaType
          );

          return (
            <MovieCard
              key={`${mediaType}-${item.id}`}
              item={item}
              type={mediaType}
              onToggle={onToggle}
              saved={saved}
            />
          );
        })}
      </div>
    </section>
  );
}

function PageTitle({ title, description }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-black text-white md:text-4xl">{title}</h1>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  );
}

function HomePage({ watchlist, toggleWatchlist }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      getTrending(),
      getPopularMovies(),
      getPopularTV(),
      getNowPlaying(),
    ])
      .then(([trending, movies, tv, playing]) => {
        if (!active) return;
        setData({
          trending: trending.data.results,
          movies: movies.data.results,
          tv: tv.data.results,
          playing: playing.data.results,
        });
      })
      .catch(() => {
        if (active) setError("Unable to load movies right now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const featured = data.trending?.[0];

  return (
    <div>
      
{featured && (
  <section className="relative isolate min-h-[620px] overflow-hidden bg-[#08090d] md:min-h-[700px]">

    {/* Background image */}
    {featured.backdrop_path && (
      <motion.img
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2 }}
        src={`${IMAGE_URL}original${featured.backdrop_path}`}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
    )}

    {/* Image overlays */}
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08090d] via-[#08090d]/85 to-[#08090d]/20" />

    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08090d] via-transparent to-[#08090d]/30" />

    {/* Hero content */}
    <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-5 py-20 md:min-h-[700px]">

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        {/* Trending badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 backdrop-blur-md">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            Trending This Week
          </span>
        </div>

        {/* Movie title */}
        <h1 className="max-w-3xl text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {getTitle(featured)}
        </h1>

        {/* Movie information */}
        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-gray-200">
          <span>{getYear(featured)}</span>

          <span className="flex items-center gap-2 text-yellow-400">
            <Star size={17} fill="currentColor" />
            <span className="font-bold">
              {featured.vote_average?.toFixed(1) || "N/A"}
            </span>
            <span className="text-gray-400">TMDB Rating</span>
          </span>

          <span className="rounded border border-white/20 px-3 py-1 text-xs uppercase tracking-wider text-gray-300">
            {featured.media_type === "tv" ? "TV Series" : "Movie"}
          </span>
        </div>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base md:text-lg">
          {featured.overview ||
            "Discover exciting stories, unforgettable characters and trending entertainment on CineWave."}
        </p>

        {/* Action buttons */}
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            to={`/details/${featured.media_type || "movie"}/${featured.id}`}
            className="group inline-flex items-center gap-3 rounded-lg bg-red-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition duration-300 hover:-translate-y-1 hover:bg-red-700"
          >
            <Play size={19} fill="currentColor" />
            Explore Movie
          </Link>

          <Link
            to="/movies"
            className="inline-flex items-center gap-3 rounded-lg border border-white/25 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20"
          >
            <Film size={19} />
            Browse Collection
          </Link>
        </div>

        {/* Bottom detail */}
        <div className="mt-10 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px w-10 bg-red-500" />
          Discover movies and TV shows you'll love.
        </div>
      </motion.div>
    </div>

    {/* Bottom fade */}
    <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-[#08090d] to-transparent" />
  </section>
)}


      <main className="mx-auto max-w-7xl px-5 py-12">
        <Section
          title="Trending Now"
          items={data.trending}
          onToggle={toggleWatchlist}
          watchlist={watchlist}
        />
        <Section
          title="Popular Movies"
          items={data.movies}
          type="movie"
          onToggle={toggleWatchlist}
          watchlist={watchlist}
        />
        <Section
          title="Popular TV Shows"
          items={data.tv}
          type="tv"
          onToggle={toggleWatchlist}
          watchlist={watchlist}
        />
        <Section
          title="Now Playing"
          items={data.playing}
          type="movie"
          onToggle={toggleWatchlist}
          watchlist={watchlist}
        />
      </main>
    </div>
  );
}

function CataloguePage({
  title,
  description,
  requests,
  type,
  watchlist,
  toggleWatchlist,
}) {
  const [category, setCategory] = useState(0);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    requests[category](page)
      .then((response) => {
        if (!active) return;
        setItems(response.data.results || []);
        setTotalPages(Math.min(response.data.total_pages || 1, 500));
      })
      .catch(() => {
        if (active) setError("Could not load this collection.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, page]);

  const changeCategory = (index) => {
    setCategory(index);
    setPage(1);
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12">
      <PageTitle title={title} description={description} />

      <div className="mb-8 flex flex-wrap gap-3">
        {requests.map((request, index) => (
          <button
            key={request.label}
            onClick={() => changeCategory(index)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              category === index
                ? "bg-red-600 text-white"
                : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {request.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <MovieCard
                key={item.id}
                item={item}
                type={type}
                onToggle={toggleWatchlist}
                saved={watchlist.some(
                  (entry) =>
                    entry.id === item.id && entry.media_type === type
                )}
              />
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-white/10 p-3 text-white disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft />
            </button>

            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-white/10 p-3 text-white disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight />
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function SearchPage({ watchlist, toggleWatchlist }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await searchTitles(query.trim());
      setResults(
        response.data.results.filter(
          (item) =>
            item.media_type === "movie" || item.media_type === "tv"
        )
      );
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12">
      <PageTitle
        title="Search"
        description="Find movies and TV shows from the TMDB collection."
      />

      <form onSubmit={handleSearch} className="mb-10 flex gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#15161d] px-4">
          <Search className="text-gray-500" size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a movie or TV show..."
            className="w-full bg-transparent py-4 text-white outline-none placeholder:text-gray-600"
          />
        </div>

        <button className="rounded-xl bg-red-600 px-6 font-bold text-white hover:bg-red-700">
          Search
        </button>
      </form>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}

      {!loading && results.length > 0 && (
        <Section
          title={`Results for "${query}"`}
          items={results}
          onToggle={toggleWatchlist}
          watchlist={watchlist}
        />
      )}

      {!loading && query && !error && results.length === 0 && (
        <p className="py-16 text-center text-gray-400">
          No matching movies or TV shows found.
        </p>
      )}
    </main>
  );
}

function DetailsPage({ watchlist, toggleWatchlist }) {
  const { type, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setItem(null);

    if (!["movie", "tv"].includes(type)) {
      setError("This title type is not supported.");
      setLoading(false);
      return;
    }

    getDetails(type, id)
      .then((response) => {
        if (active) setItem(response.data);
      })
      .catch(() => {
        if (active) setError("Unable to load this title.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type, id]);

  if (loading) return <Loading />;
  if (error || !item) return <ErrorMessage message={error || "Title not found."} />;

  const saved = watchlist.some(
    (entry) => entry.id === item.id && entry.media_type === type
  );

  const trailer = item.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer"
  );

  return (
    <main className="min-h-screen">
      <section className="relative min-h-[580px] overflow-hidden">
        {item.backdrop_path && (
          <img
            src={`${IMAGE_URL}original${item.backdrop_path}`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/90 to-[#08090d]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] to-transparent" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-5 py-16 md:flex-row md:items-center">
          {item.poster_path && (
            <img
              src={`${IMAGE_URL}w500${item.poster_path}`}
              alt={getTitle(item)}
              className="w-52 rounded-2xl shadow-2xl md:w-64"
            />
          )}

          <div className="max-w-2xl">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
              <ArrowLeft size={16} /> Back to Home
            </Link>

            <h1 className="text-4xl font-black text-white md:text-6xl">
              {getTitle(item)}
            </h1>

            {item.tagline && (
              <p className="mt-3 italic text-gray-400">{item.tagline}</p>
            )}

            <div className="my-5 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span>{getYear(item)}</span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={15} fill="currentColor" />
                {item.vote_average?.toFixed(1) || "N/A"}
              </span>
              {item.runtime && <span>{item.runtime} minutes</span>}
              {item.number_of_seasons && (
                <span>{item.number_of_seasons} seasons</span>
              )}
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {item.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-gray-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <h2 className="mb-2 text-lg font-bold text-white">Overview</h2>
            <p className="leading-7 text-gray-300">{item.overview || "No overview available."}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => toggleWatchlist(item, type)}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
              >
                <Bookmark size={18} />
                {saved ? "Remove from Watchlist" : "Add to Watchlist"}
              </button>

              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 font-bold text-white hover:bg-white/10"
                >
                  <Play size={18} /> Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <h2 className="mb-6 text-2xl font-bold text-white">Top Cast</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {(item.credits?.cast || []).slice(0, 5).map((person) => (
            <div key={person.id} className="rounded-xl bg-[#14151c] p-4">
              {person.profile_path ? (
                <img
                  src={`${IMAGE_URL}w185${person.profile_path}`}
                  alt={person.name}
                  className="mb-3 aspect-square w-full rounded-lg object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-white/5 text-gray-500">
                  No image
                </div>
              )}
              <p className="font-semibold text-white">{person.name}</p>
              <p className="mt-1 text-xs text-gray-400">{person.character}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function WatchlistPage({ watchlist, toggleWatchlist }) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12">
      <PageTitle
        title="My Watchlist"
        description="Your saved movies and TV shows in one place."
      />

      {watchlist.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#14151c] px-5 py-20 text-center">
          <Bookmark className="mx-auto mb-5 text-red-500" size={45} />
          <h2 className="text-xl font-bold text-white">Your watchlist is empty</h2>
          <p className="mt-2 text-gray-400">
            Save movies and shows to find them here later.
          </p>
          <Link
            to="/movies"
            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {watchlist.map((item) => (
            <MovieCard
              key={`${item.media_type}-${item.id}`}
              item={item}
              type={item.media_type}
              onToggle={toggleWatchlist}
              saved
            />
          ))}
        </div>
      )}
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#08090d] px-5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">
        <div>
          <Link to="/" className="text-xl font-black">
            <span className="text-red-500">CINE</span>
            <span className="text-white">WAVE</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            Discover your next favourite movie.
          </p>
        </div>

        <p className="max-w-xl text-xs leading-6 text-gray-500">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
          Movie and TV information is provided by The Movie Database.
        </p>
      </div>
    </footer>
  );
}

function AppContent() {
  const { watchlist, toggleWatchlist } = WatchlistContext.value;

  return (
    <div className="min-h-screen bg-[#08090d]">
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />

        <Route
          path="/movies"
          element={
            <CataloguePage
              title="Explore Movies"
              description="Discover popular, top-rated and upcoming movies."
              type="movie"
              requests={[
                Object.assign(getPopularMovies, { label: "Popular" }),
                Object.assign(getTopRatedMovies, { label: "Top Rated" }),
                Object.assign(getUpcomingMovies, { label: "Upcoming" }),
                Object.assign(getNowPlaying, { label: "Now Playing" }),
              ]}
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />

        <Route
          path="/tv-shows"
          element={
            <CataloguePage
              title="TV Shows"
              description="Explore popular and highly rated television series."
              type="tv"
              requests={[
                Object.assign(getPopularTV, { label: "Popular" }),
                Object.assign(getTopRatedTV, { label: "Top Rated" }),
              ]}
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />

        <Route
          path="/search"
          element={
            <SearchPage
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />

        <Route
          path="/watchlist"
          element={
            <WatchlistPage
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />

        <Route
          path="/details/:type/:id"
          element={
            <DetailsPage
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />

        <Route
          path="*"
          element={
            <main className="flex min-h-[65vh] flex-col items-center justify-center px-5 text-center">
              <h1 className="text-6xl font-black text-red-500">404</h1>
              <p className="mt-3 text-gray-400">This page could not be found.</p>
              <Link to="/" className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-bold text-white">
                Return Home
              </Link>
            </main>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default function App() {
  const watchlistState = useWatchlist();
  WatchlistContext.value = watchlistState;

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
