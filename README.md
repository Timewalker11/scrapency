# Scrapency

A React + Vite website with an interactive Google Map: search for a place,
click the map to drop markers, right-click a marker to remove it.

## Setup

1. Get a Google Maps API key with the **Maps JavaScript API** and **Places API**
   enabled: https://console.cloud.google.com/google/maps-apis
2. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
3. Edit `.env` and paste in your API key.
4. Install dependencies and start the dev server:
   ```
   npm install
   npm run dev
   ```
5. Open the URL Vite prints (usually http://localhost:5173).

`.env` is gitignored so your API key never gets committed. When deploying,
restrict your key to your production domain in the Google Cloud Console, and
set `VITE_GOOGLE_MAPS_API_KEY` as an environment variable in your hosting
provider.

## Features

- Search box (Google Places Autocomplete) to jump to any address or place
- Click anywhere on the map to drop a marker
- Right-click a marker to remove it
- Sidebar list of all dropped/searched markers

## Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api)
