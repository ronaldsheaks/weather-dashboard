import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import './App.css'

const usaCenter = [39.5, -98.35]

function RecenterMap({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}

function weatherCodeToEmoji(code) {
  if (code === 0) return '☀️'
  if ([1, 2, 3].includes(code)) return '⛅'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️'
  if ([95, 96, 99].includes(code)) return '⛈️'
  return '🌤️'
}

function isLower48(lat, lon) {
  return lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66
}

export default function App() {
  const [searchText, setSearchText] = useState('')
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Continental U.S.',
    coords: usaCenter,
  })
  const [message, setMessage] = useState(
    'Search any city or place in the continental U.S.'
  )

  const [temperature, setTemperature] = useState('--')
  const [weatherEmoji, setWeatherEmoji] = useState('🌤️')
  const [weatherNote, setWeatherNote] = useState('Loading live weather...')

  useEffect(() => {
    async function fetchWeather() {
      try {
        const [lat, lon] = selectedLocation.coords

        setWeatherNote(`Loading live weather for ${selectedLocation.name}...`)

        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}` +
          `&longitude=${lon}` +
          `&current=temperature_2m,weather_code` +
          `&temperature_unit=fahrenheit`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Weather request failed')
        }

        const data = await response.json()
        const current = data.current

        if (!current) {
          throw new Error('No current weather returned')
        }

        setTemperature(`${Math.round(current.temperature_2m)}°F`)
        setWeatherEmoji(weatherCodeToEmoji(current.weather_code))
        setWeatherNote(`Live weather loaded for ${selectedLocation.name}.`)
      } catch (error) {
        console.error(error)
        setTemperature('--')
        setWeatherEmoji('❓')
        setWeatherNote('Could not load live weather.')
      }
    }

    fetchWeather()
  }, [selectedLocation])

  async function handleSearch(e) {
  e.preventDefault()

  const query = searchText.trim()

  if (query.length < 2) {
  setMessage('Type at least 2 letters.')
  return
}

const stateMap = {
  AL: { abbr: 'AL', full: 'Alabama' },
  AK: { abbr: 'AK', full: 'Alaska' },
  AZ: { abbr: 'AZ', full: 'Arizona' },
  AR: { abbr: 'AR', full: 'Arkansas' },
  CA: { abbr: 'CA', full: 'California' },
  CO: { abbr: 'CO', full: 'Colorado' },
  CT: { abbr: 'CT', full: 'Connecticut' },
  DE: { abbr: 'DE', full: 'Delaware' },
  FL: { abbr: 'FL', full: 'Florida' },
  GA: { abbr: 'GA', full: 'Georgia' },
  HI: { abbr: 'HI', full: 'Hawaii' },
  ID: { abbr: 'ID', full: 'Idaho' },
  IL: { abbr: 'IL', full: 'Illinois' },
  IN: { abbr: 'IN', full: 'Indiana' },
  IA: { abbr: 'IA', full: 'Iowa' },
  KS: { abbr: 'KS', full: 'Kansas' },
  KY: { abbr: 'KY', full: 'Kentucky' },
  LA: { abbr: 'LA', full: 'Louisiana' },
  ME: { abbr: 'ME', full: 'Maine' },
  MD: { abbr: 'MD', full: 'Maryland' },
  MA: { abbr: 'MA', full: 'Massachusetts' },
  MI: { abbr: 'MI', full: 'Michigan' },
  MN: { abbr: 'MN', full: 'Minnesota' },
  MS: { abbr: 'MS', full: 'Mississippi' },
  MO: { abbr: 'MO', full: 'Missouri' },
  MT: { abbr: 'MT', full: 'Montana' },
  NE: { abbr: 'NE', full: 'Nebraska' },
  NV: { abbr: 'NV', full: 'Nevada' },
  NH: { abbr: 'NH', full: 'New Hampshire' },
  NJ: { abbr: 'NJ', full: 'New Jersey' },
  NM: { abbr: 'NM', full: 'New Mexico' },
  NY: { abbr: 'NY', full: 'New York' },
  NC: { abbr: 'NC', full: 'North Carolina' },
  ND: { abbr: 'ND', full: 'North Dakota' },
  OH: { abbr: 'OH', full: 'Ohio' },
  OK: { abbr: 'OK', full: 'Oklahoma' },
  OR: { abbr: 'OR', full: 'Oregon' },
  PA: { abbr: 'PA', full: 'Pennsylvania' },
  RI: { abbr: 'RI', full: 'Rhode Island' },
  SC: { abbr: 'SC', full: 'South Carolina' },
  SD: { abbr: 'SD', full: 'South Dakota' },
  TN: { abbr: 'TN', full: 'Tennessee' },
  TX: { abbr: 'TX', full: 'Texas' },
  UT: { abbr: 'UT', full: 'Utah' },
  VT: { abbr: 'VT', full: 'Vermont' },
  VA: { abbr: 'VA', full: 'Virginia' },
  WA: { abbr: 'WA', full: 'Washington' },
  WV: { abbr: 'WV', full: 'West Virginia' },
  WI: { abbr: 'WI', full: 'Wisconsin' },
  WY: { abbr: 'WY', full: 'Wyoming' },
  DC: { abbr: 'DC', full: 'District of Columbia' },
}

  const parts = query.split(',').map((part) => part.trim())
  const cityPart = parts[0]
  const statePart = parts[1]?.toUpperCase() || null
  const fullStateName = statePart ? stateMap[statePart] : null

  try {
    setMessage(`Searching for "${query}"...`)

    const url =
      `https://geocoding-api.open-meteo.com/v1/search` +
      `?name=${encodeURIComponent(cityPart)}` +
      `&count=10` +
      `&language=en` +
      `&format=json` +
      `&countryCode=US`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()
    const results = data.results || []

    let matches = results.filter(
      (place) => isLower48(place.latitude, place.longitude)
    )

    if (fullStateName) {
      matches = matches.filter(
        (place) => place.admin1?.toLowerCase() === fullStateName.toLowerCase()
      )
    }

    const bestMatch = matches[0]

    if (!bestMatch) {
      setMessage(
        fullStateName
          ? `No continental U.S. result found for ${cityPart}, ${statePart}.`
          : 'No continental U.S. result found.'
      )
      return
    }

    const locationName = bestMatch.admin1
      ? `${bestMatch.name}, ${bestMatch.admin1}`
      : bestMatch.name

    setSelectedLocation({
      name: locationName,
      coords: [bestMatch.latitude, bestMatch.longitude],
    })

    setMessage(`Showing weather for ${locationName}.`)
  } catch (error) {
    console.error(error)
    setMessage('Location search failed.')
  }

    

    try {
      setMessage(`Searching for "${query}"...`)

      const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(query)}` +
        `&count=10` +
        `&language=en` +
        `&format=json` +
        `&countryCode=US`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }

      const data = await response.json()
      const results = data.results || []

      const lower48Match = results.find((place) =>
        isLower48(place.latitude, place.longitude)
      )

      if (!lower48Match) {
        setMessage('No continental U.S. result found.')
        return
      }

      const locationName = lower48Match.admin1
        ? `${lower48Match.name}, ${lower48Match.admin1}`
        : lower48Match.name

      setSelectedLocation({
        name: locationName,
        coords: [lower48Match.latitude, lower48Match.longitude],
      })

      setMessage(`Showing weather for ${locationName}.`)
    } catch (error) {
      console.error(error)
      setMessage('Location search failed.')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Weather Dashboard I</h1>

        <form onSubmit={handleSearch}>
          <input
            className="search"
            type="text"
            placeholder="Search location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </form>
      </header>

      <main className="layout">
        <section className="map-panel">
          <MapContainer
            center={selectedLocation.coords}
            zoom={4}
            minZoom={3}
            maxZoom={10}
            scrollWheelZoom={true}
            className="map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap center={selectedLocation.coords} zoom={6} />

            <Marker position={selectedLocation.coords}>
              <Popup>{selectedLocation.name}</Popup>
            </Marker>
          </MapContainer>
        </section>

        <aside className="sidebar">
          <div className="widget">
            <h2>Temperature</h2>
            <p className="big">{temperature}</p>
          </div>

          <div className="widget">
            <h2>Weather Emoji</h2>
            <p className="big">{weatherEmoji}</p>
          </div>

          <div className="widget">
            <h2>Selected Location</h2>
            <p>{selectedLocation.name}</p>
            <p>{message}</p>
            <p>{weatherNote}</p>
          </div>
        </aside>
      </main>
    </div>
  )
}