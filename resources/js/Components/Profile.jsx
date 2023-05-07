import { MapContainer, TileLayer, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useContext, useEffect, useState } from "react"
import { get, httpDelete, post } from "@/api";
import TextArea from "./TextArea";
import PrimaryButton from "./PrimaryButton";
import Swal from "sweetalert2";
import moment from "moment";
import { UserContext } from "@/Contexts/UserContext";
import { deleteComment } from "@/utils/comments";

function MapMover({ position }) {
    const map = useMap();
    map.invalidateSize()
    map.setView(position, map.getZoom());
}

export default function Profile({ aircraft, className = "", children, setLoading }) {

    const [aircraftPos, setAircraftPos] = useState([aircraft.location_lat, aircraft.location_lng]);
    const [user, setUser] = useState({});
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [knownUsers, setKnownUsers] = useState({});
    const [submitCommentLoading, setSubmitCommentLoading] = useState(false);
    const loggedInUser = useContext(UserContext);

    useEffect(() => {
        setUser({ name: "Getting name..." })
        getUserAndComments(aircraft.user_id, true);
        setAircraftPos([aircraft.location_lat, aircraft.location_lng]);
    }, [aircraft.reg]);

    const submitComment = async (e) => {
        e.preventDefault();
        setSubmitCommentLoading(true);
        await post("/api/comments", { comment: comment, aircraftId: aircraft.id })
            .then((res) => {
                const newComment = { content: comment, author: loggedInUser.name, author_id: loggedInUser.id, date: new Date(), id: res.id }
                setComments([...comments, newComment])
                setSubmitCommentLoading(false);
            }).catch((err) => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Could not post a comment.",
                    footer: "If this continues, please contact the web administrator.",
                })
                setSubmitCommentLoading(false);
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

    const handleCommentDelete = async (commentId) => {
        Swal.fire({
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
                await deleteComment(commentId);
                setComments(comments.filter((comment) => comment.id != commentId));
            }
        })
    }

    return (
        <>
            <div className={`rounded-lg w-full max-w-screen-lg mx-10 overflow-scroll bg-op-card p-3 mb-5 ${className}`}>
                <div>
                    <img className="rounded-lg" src={aircraft.featured_photo_url}></img>
                </div>
                <div className="text-center items-center my-3">
                    <p className="uppercase text-5xl mb-1">{aircraft.reg}</p>
                    <p className="">Submitted by: {<a href={`/profile/${user.id}`} className="underline text-white">{user.name}</a> || "Getting name..."}</p>
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
                                        <div className="w-full flex justify-center items-center mb-3">
                                            <div role="status">
                                                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                </svg>
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                            <span>Loading...</span>
                                        </div>
                                        :
                                        comments.length > 0 ?
                                            comments.map((comment, index) => {
                                                return (
                                                    <div className="bg-op-darkblue rounded mb-3 p-3 flex justify-between" key={index}>
                                                        <div className="text-start overflow-scroll">
                                                            <div className="max-w-full">{comment.content}</div>
                                                            <div className="text-op-card-secondary"><em>- <a className="underline" href={`/profile/${comment.author_id}`}>
                                                                {comment.author || comment.author_id}</a>, {moment(comment.date).calendar()}</em></div>
                                                        </div>
                                                        <div className="text-end ms-5 self-center">
                                                            <button type="button" onClick={() => handleCommentDelete(comment.id)} hidden={loggedInUser.id !== comment.author_id && loggedInUser.role !== "Admin"}>
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
                                        <PrimaryButton className="mt-2" disabled={submitCommentLoading}>Submit</PrimaryButton>
                                    </div>
                                </div>
                            </form>
                        </li>
                    </ul>
                </div>
                {children}
            </div>
        </>
    )
}
