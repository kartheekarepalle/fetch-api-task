import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const limit = 12;

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = (page - 1) * limit;
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        const detailedData = await Promise.all(
          data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            return res.json();
          })
        );

        setPokemons(detailedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPokemons();
  }, [page]);

  // Multi-field search (name, type, ability, weight)
  const filteredPokemons = pokemons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.types.some((t) => t.type.name.toLowerCase().includes(search.toLowerCase())) ||
      p.abilities.some((a) => a.ability.name.toLowerCase().includes(search.toLowerCase())) ||
      String(p.weight).includes(search)
  );

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <header className="header">
        <h1 className="title">🌌 PokéVerse</h1>
        <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, type, ability, or weight..."
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="info">Loading Pokémons...</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="grid-container">
        {!loading &&
          !error &&
          filteredPokemons.map((pokemon, index) => (
            <div key={pokemon.id} className={`card card-${(index % 6) + 1}`}>
              <img
                src={pokemon.sprites.other["official-artwork"].front_default}
                alt={pokemon.name}
                className="pokemon-img"
              />
              <h3 className="pokemon-name">{pokemon.name}</h3>
              <p className="pokemon-type">
                <b>Type:</b> {pokemon.types.map((t) => t.type.name).join(", ")}
              </p>
              <p className="pokemon-info">
                <b>Ability:</b> {pokemon.abilities[0].ability.name}
              </p>
              <p className="pokemon-info">
                <b>Weight:</b> {pokemon.weight}
              </p>
            </div>
          ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="btn"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ⬅ Previous
        </button>
        <span className="page-number"> Page {page} </span>
        <button className="btn" onClick={() => setPage(page + 1)}>
          Next ➡
        </button>
      </div>
    </div>
  );
}

export default App;
