const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const weatherInfo = document.getElementById("weatherInfo");

function getWeatherDescription(code) {
  const weather = {
    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Foggy", "🌫️"],
    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy Drizzle", "🌧️"],
    61: ["Light Rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy Rain", "🌧️"],
    71: ["Light Snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy Snow", "❄️"],
    80: ["Rain Showers", "🌦️"],
    81: ["Rain Showers", "🌧️"],
    82: ["Heavy Showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with Hail", "⛈️"],
    99: ["Heavy Thunderstorm", "⛈️"]
  };

  return weather[code] || ["Unknown Weather", "🌡️"];
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city name.";
    return;
  }

  message.textContent = "Loading weather...";
  weatherInfo.classList.add("hidden");

  try {
    const geoURL =
      "https://geocoding-api.open-meteo.com/v1/search?" +
      new URLSearchParams({
        name: city,
        count: 1,
        language: "en",
        format: "json"
      });

    const geoResponse = await fetch(geoURL);
    if (!geoResponse.ok) {
      throw new Error("Unable to search for the city.");
    }

    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Try another city.");
    }

    const place = geoData.results[0];
    const { latitude, longitude, name, country } = place;

    const weatherURL =
      "https://api.open-meteo.com/v1/forecast?" +
      new URLSearchParams({
        latitude,
        longitude,
        current:
          "temperature_2m,relative_humidity_2m," +
          "apparent_temperature,weather_code,wind_speed_10m",
        timezone: "auto"
      });

    const weatherResponse = await fetch(weatherURL);
    if (!weatherResponse.ok) {
      throw new Error("Unable to get weather information.");
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    const [description, icon] = getWeatherDescription(current.weather_code);

    document.getElementById("cityName").textContent = `${name}, ${country}`;
    document.getElementById("weatherIcon").textContent = icon;
    document.getElementById("temperature").textContent =
      `${Math.round(current.temperature_2m)}°C`;
    document.getElementById("condition").textContent = description;
    document.getElementById("humidity").textContent =
      `${current.relative_humidity_2m}%`;
    document.getElementById("wind").textContent =
      `${current.wind_speed_10m} km/h`;
    document.getElementById("feelsLike").textContent =
      `${Math.round(current.apparent_temperature)}°C`;

    message.textContent = `Weather updated: ${current.time.replace("T", " ")}`;
    weatherInfo.classList.remove("hidden");
  } catch (error) {
    message.textContent = error.message || "Something went wrong. Please try again.";
  }
});
