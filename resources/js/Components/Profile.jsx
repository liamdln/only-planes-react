import { MapContainer, TileLayer, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from "react"
import { get } from "@/api";

function MapMover({ position }) {
    const map = useMap();
    map.invalidateSize()
    map.setView(position, map.getZoom());
}

export default function Profile({ aircraft, className = "", children }) {

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
            // console.error(err);
            setUser({ name: "Unknown" })
        })
    }

    return (
        <div className={`rounded-lg w-full max-w-screen-lg mx-10 overflow-scroll bg-op-card p-3 mb-5 ${className}`}>
            <div>
                <img className="rounded-lg" src={aircraft.featured_photo_url}></img>
            </div>
            <div className="text-center items-center my-3">
                <p className="uppercase text-5xl mb-1">{aircraft.reg}</p>
                <p className="">Submitted by: {<a href={`/user/${user.id}`} className="underline text-white">{user.name}</a> || "Getting name..." }</p>
            </div>
            <div className="text-start p-10">
                <ul>
                    <li className="text-center mb-10">
                        <span className="text-xl">Type</span>
                        <hr className="w-48 h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                        <span>{aircraft.make} {aircraft.model}</span></li>
                    <li className="text-center mb-10">
                        <span className="text-xl">Location:</span>
                        <hr className="w-48 h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                        <div className="h-96">
                            <MapContainer
                                center={aircraftPos}
                                zoom={13}
                                scrollWheelZoom={false}
                                style={{ height: "100%", width: "100%", margin: "auto", color: "#000", zIndex: "40" }}>
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
                    <li className="text-center mb-10 mt-3">
                        <span className="text-xl">Comments:</span>
                        <hr className="w-48 h-1 mx-auto bg-op-primary border-0 rounded my-3" />

                    </li>
                </ul>
            </div>
            { children }
        </div>
    )
}
