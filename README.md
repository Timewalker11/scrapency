# Scrapency

A React + Vite website with an interactive map (OpenStreetMap via Leaflet —
no API key required): search for a place, click the map to drop markers,
right-click a marker to remove it.

## Setup

Install dependencies and start the dev server:

```
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Features

- Search box (via OpenStreetMap's Nominatim geocoder) to jump to any address
  or place
- Click anywhere on the map to drop a marker
- Right-click a marker to remove it
- Sidebar list of all dropped/searched markers

## Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [react-leaflet](https://react-leaflet.js.org/) + [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/) tiles and
  [Nominatim](https://nominatim.org/) search — both free, no API key needed

## Switching to Google Maps

This originally used the Google Maps JavaScript API. If you'd rather use
Google's maps/data (e.g. for Street View, better business listings, or higher
search volume), you'll need a Google Maps API key — see
https://console.cloud.google.com/google/maps-apis — and can swap `MapView`
and `SearchBar` back to `@react-google-maps/api`.
