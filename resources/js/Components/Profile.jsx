import { MapContainer, TileLayer, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useContext, useEffect, useState } from "react"
import { get, httpDelete, post } from "@/api";
import TextArea from "./TextArea";
import PrimaryButton from "./PrimaryButton";
import Swal from "sweetalert2";
import moment from "moment";
import { UserContext } from "@/Contexts/UserContext";

function MapMover({ position }) {
    const map = useMap();
    map.invalidateSize()
    map.setView(position, map.getZoom());
}

export default function Profile({ aircraft, className = "", children }) {

    const [aircraftPos, setAircraftPos] = useState([aircraft.location_lat, aircraft.location_lng]);
    const [user, setUser] = useState({});
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [knownUsers, setKnownUsers] = useState({});
    const loggedInUser = useContext(UserContext);

    useEffect(() => {
        setUser({ name: "Getting name..." })
        getUserAndComments(aircraft.user_id, true);
        setAircraftPos([aircraft.location_lat, aircraft.location_lng]);
    }, [aircraft.reg]);

    const submitComment = async (e) => {
        e.preventDefault();
        await post("/api/comments", { comment: comment, aircraftId: aircraft.id })
            .then((res) => {
                const newComment = { content: comment, author: loggedInUser.name, author_id: loggedInUser.id, date: new Date(), id: res.id }
                setComments([...comments, newComment])
            }).catch((err) => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Could not post a comment.",
                    footer: "If this continues, please contact the web administrator.",
                })
            })
        setComment("");
    }

    const getUserAndComments = async (user_id) => {
        setCommentsLoading(true);
        setComments([]);
        try {
            const userArray = await get(`/api/users/${user_id}`);
            const aircraftOwner = userArray[0];
            setUser(aircraftOwner);
            setKnownUsers({ ...knownUsers, [aircraftOwner.id]: aircraftOwner.name })

            const comments = await get(`/api/comments?aircraftId=${aircraft.id}`);
            for (let i = 0; i < comments.length; i++) {
                if (Object.keys(knownUsers).includes(comments[i].author_id)) {
                    comments[i].author = knownUsers[comments[i].author_id];
                } else {
                    const commentUser = await get(`/api/users/${comments[i].author_id}`);
                    comments[i].author = commentUser[0].name;
                    setKnownUsers({ ...knownUsers, [comments[i].author_id]: commentUser[0].name })
                }
            }
            setComments(comments);
            setCommentsLoading(false);
        } catch (e) {
            console.log(e);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not fetch comments or owner for this aircraft.",
                footer: "If this continues, please contact the web administrator.",
            })
            setUser({ name: "Unknown" });
            setCommentsLoading(false);
        }
    }

    const deleteComment = async (commentId) => {
        await Swal.fire({
            icon: "question",
            title: "Are you sure?",
            text: "Are you sure you want to delete this comment?",
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: "Delete",
            denyButtonText: "Keep",
            confirmButtonColor: "#D50000",
            denyButtonColor: "#00C853"
        }).then(async (response) => {
            if (response.isConfirmed) {
                await httpDelete(`/api/comments?commentId=${commentId}`)
                    .then(() => {
                        setComments(comments.filter((comment) => comment.id != commentId));
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Could not delete comment.",
                            footer: "If this continues, please contact the web administrator.",
                        })
                    })
            }
        })

    }

    return (
        <div className={`rounded-lg w-full max-w-screen-lg mx-10 overflow-scroll bg-op-card p-3 mb-5 ${className}`}>
            <div>
                <img className="rounded-lg" style={{ width: "1000px", height: "526.5px" }} src={aircraft.featured_photo_url}></img>
            </div>
            <div className="text-center items-center my-3">
                <p className="uppercase text-5xl mb-1">{aircraft.reg}</p>
                <p className="">Submitted by: {<a href={`/user/${user.id}`} className="underline text-white">{user.name}</a> || "Getting name..."}</p>
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
                                        Last reported location of <div className="uppercase">{aircraft.reg}</div>
                                    </Popup>
                                </Marker>
                                <MapMover position={aircraftPos} />
                            </MapContainer>
                        </div>
                    </li>
                    <li className="text-center mb-10 mt-3">
                        <span className="text-xl">Comments:</span>
                        <hr className="w-48 h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                        <form onSubmit={(e) => submitComment(e)}>
                            <div>
                                {commentsLoading ?
                                    <div>Loading...</div>
                                    :
                                    comments.length > 0 ?
                                        comments.map((comment, index) => {
                                            return (
                                                <div className="bg-op-darkblue rounded mb-3 p-3 flex justify-between" key={index}>
                                                    <div className="text-start overflow-scroll">
                                                        <div className="max-w-full">{comment.content}</div>
                                                        <div className="text-op-card-secondary"><em>- <a className="underline" href={`/user/${comment.author_id}`}>
                                                            {comment.author || comment.author_id}</a>, {moment(comment.date).calendar()}</em></div>
                                                    </div>
                                                    <div className="text-end ms-5 self-center">
                                                        <button type="button" onClick={() => deleteComment(comment.id)} hidden={ loggedInUser.id !== comment.author_id && loggedInUser.role !== "Admin" }>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                        :
                                        <div className="text-center text-op-card-secondary mb-3"><em>No comments.</em></div>}
                            </div>
                            <div>
                                <TextArea
                                    id="comment"
                                    type="text"
                                    name="comment"
                                    className="mt-1 block w-full bg-op-darkblue max-h-40 min-h-fit"
                                    isFocused={true}
                                    placeholder="Enter comment..."
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <PrimaryButton className="mt-2">Submit</PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </li>
                </ul>
            </div>
            {children}
        </div>
    )
}
