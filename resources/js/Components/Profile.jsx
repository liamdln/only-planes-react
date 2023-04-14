import { MapContainer, TileLayer, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from "react"
import { get } from "@/api";

function MapMover({ position }) {
    const map = useMap();
    map.setView(position, map.getZoom());
}

export default function Profile({ aircraft }) {

    const [aircraftPos, setAircraftPos] = useState([aircraft.location_lat, aircraft.location_lng]);
    const [user, setUser] = useState({});

    useEffect(() => {
        setUser({ name: "Getting name..." })
        getUserFromId(aircraft.user_id);
        setAircraftPos([aircraft.location_lat, aircraft.location_lng]);
    }, [aircraft.reg]);

    const getUserFromId = (id) => {
        get(`/api/users/${id}`).then((res) => {
            setUser(res[0])
            // console.log(res[0]);
        }).catch((err) => {
            console.error(err);
            setUser({ name: "Unknown" })
        })
    }

    return (
        <div className="rounded-lg w-full max-w-screen-lg mx-10 overflow-scroll bg-op-card p-3 mb-5">
            <div>
                <img className="rounded-lg" src={aircraft.featured_photo_url}></img>
            </div>
            <div className="text-center items-center my-3">
                <p className="uppercase text-5xl mb-1">{aircraft.reg}</p>
                <p className="">Submitted by: { user.name || "Getting name..." }</p>
            </div>
            <div className="text-start p-10">
                <ul>
                    <li>Type: {aircraft.make} {aircraft.model}</li>
                    <li>
                        <span>Location:</span>
                        <div className="h-96">
                            <MapContainer
                                center={aircraftPos}
                                zoom={13}
                                scrollWheelZoom={true}
                                style={{ height: "100%", width: "100%", margin: "auto", color: "#000" }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={aircraftPos}>
                                    <Popup>
                                        Last reported location of <div className="uppercase">{ aircraft.reg }</div>
                                    </Popup>
                                </Marker>
                                <MapMover position={aircraftPos} />
                            </MapContainer>
                        </div>
                    </li>
                    <li className="mt-3">Comments:</li>
                </ul>
            </div>
        </div>
    )
}
