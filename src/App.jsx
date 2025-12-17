import { useState } from "react";
import "./App.css";
import dutechCloud from "./assets/dutechCloud.png";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)

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
    Night: "night.jpg",
  };

  const searchWeather = async () => {
  if (!city.trim()) return;

  try {
    setLoading(true);
    setError("");
    setWeather(null);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      setError("City not found");
      setLoading(false);
      return;
    }

    const data = await response.json();
    setWeather(data);
  } catch (err) {
    setError("Something went wrong.");
  } finally {
    setLoading(false);
  }
};


  const getBackgroundImage = () => {
    if (!weather) return "default.png";
    const condition = weather.weather[0].main;
    return weatherBackgrounds[condition] || "default.png";
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: `url('/assets/${getBackgroundImage()}')`,
      }}
    >
      <header className="header">
        <img src={dutechCloud} className="logo" alt="Dutech Cloud" />
        <h1>DutechCloud • Weather App</h1>
      </header>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={searchWeather}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.name}</h2>
          <p className="temp">{Math.round(weather.main.temp)}°C</p>
          <p className="condition">{weather.weather[0].main}</p>
          <p className="description">{weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );

}

export default App;
