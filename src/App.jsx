
import { useState, useEffect } from "react";
import "./App.css";
import dutechCloud from "./assets/dutechCloud.png";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [unit, setUnit] = useState("metric"); // metric = °C, imperial = °F

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  const weatherBackgrounds = {
    Clear: "clear.png",
    Clouds: "clouds.png",
    Rain: "rain.png",
    Snow: "snow.png",
    Thunderstorm: "storm.png",
    Drizzle: "rain.png",
    Mist: "clouds.png",
    Fog: "clouds.png",
  };

  /* ----------------------------
     LOAD SAVED DATA ON START
  ----------------------------- */
  useEffect(() => {
    const storedSearches = JSON.parse(
      localStorage.getItem("recentSearches")
    );
    if (storedSearches) setRecentSearches(storedSearches);

    const savedUnit = localStorage.getItem("unit");
    if (savedUnit) setUnit(savedUnit);
  }, []);

  /* ----------------------------
     AUTO LOCATION WEATHER
  ----------------------------- */
  const fetchWeatherByLocation = async (lat, lon) => {
    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`
      );

      if (!response.ok) {
        setError("Unable to fetch location weather");
        return;
      }

      const data = await response.json();
      setWeather(data);
    } catch {
      setError("Location weather failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByLocation(latitude, longitude);
      },
      () => console.log("Location permission denied")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  /* ----------------------------
     RECENT SEARCHES
  ----------------------------- */
  const saveRecentSearch = (cityName) => {
    const updated = [
      cityName,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== cityName.toLowerCase()
      ),
    ].slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  /* ----------------------------
     MANUAL SEARCH
  ----------------------------- */
  const searchWeather = async (searchCity = city) => {
    if (!searchCity.trim()) return;

    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${apiKey}&units=${unit}`
      );

      if (!response.ok) {
        setError("City not found");
        return;
      }

      const data = await response.json();
      setWeather(data);
      saveRecentSearch(data.name);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------
     UNIT TOGGLE
  ----------------------------- */
  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    localStorage.setItem("unit", newUnit);
  };

  /* ----------------------------
     BACKGROUND LOGIC
  ----------------------------- */
  const getBackgroundImage = () => {
    if (!weather) return "";
    if (weather.weather[0].icon.includes("n")) return "night.jpg";
    return weatherBackgrounds[weather.weather[0].main] || "";
  };

  return (
    <div
      className={`app ${weather ? "has-bg" : ""}`}
      style={
        weather
          ? { backgroundImage: `url('/backgrounds/${getBackgroundImage()}')` }
          : {}
      }
    >
      {/* HEADER */}
      <header className="header">
        <img src={dutechCloud} className="logo" alt="Dutech Cloud" />
        <h1>DutechCloud • Weather App</h1>
      </header>

      {/* SEARCH */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={() => searchWeather()} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* UNIT TOGGLE */}
      <div className="unit-toggle">
        <button onClick={toggleUnit}>
          Switch to {unit === "metric" ? "°F" : "°C"}
        </button>
      </div>

      {/* RECENT SEARCHES */}
      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <p>Recent searches:</p>
          <div className="recent-list">
            {recentSearches.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setCity(item);
                  searchWeather(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STATES */}
      {loading && <p className="loading">Fetching weather...</p>}
      {error && <p className="error">{error}</p>}

      {/* WEATHER CARD */}
      {weather && (
        <div className="weather-card">
          <h2>{weather.name}</h2>
          <p className="temp">
            {Math.round(weather.main.temp)}°
            {unit === "metric" ? "C" : "F"}
          </p>
          <p className="condition">{weather.weather[0].main}</p>
          <p className="description">
            {weather.weather[0].description}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
