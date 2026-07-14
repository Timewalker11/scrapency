function Sidebar({ markers, onRemove }) {
  return (
    <aside className="sidebar">
      <h2>Saved Markers</h2>
      {markers.length === 0 ? (
        <p className="hint">
          Click anywhere on the map to drop a marker, or search above.
        </p>
      ) : (
        <ul className="marker-list">
          {markers.map((marker) => (
            <li key={marker.id}>
              <span>
                {marker.label ||
                  `${marker.position.lat.toFixed(4)}, ${marker.position.lng.toFixed(4)}`}
              </span>
              <button type="button" onClick={() => onRemove(marker.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export default Sidebar
