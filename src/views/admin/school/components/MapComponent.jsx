import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const MapComponent = ({ position }) => {
  if (!position || !position.lat || !position.lon) {
    return null
  }

  const { lat, lon } = position

  return (
    <>
      <MapContainer style={{ height: 536 }} center={position} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[lat, lon]}>
          <Popup>Vị trí đăng nhập</Popup>
        </Marker>
      </MapContainer>
    </>
  )
}

export default MapComponent
