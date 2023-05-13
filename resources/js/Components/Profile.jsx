import { MapContainer, TileLayer, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useContext, useEffect, useState } from "react"
import { get } from "@/api";
import TextArea from "./TextArea";
import PrimaryButton from "./PrimaryButton";
import Swal from "sweetalert2";
import { UserContext } from "@/Contexts/UserContext";
import { addComment, deleteComment } from "@/utils/comments";
import Comment from "./Comment";
import PrimaryButtonEvent from "./PrimaryButtonEvent";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { getAircraftTags, getAllTags } from "@/utils/tag";

// move the map to the new profile location
// when the profile is changed.
// cannot be in the page component as
// leaflet handles state differently to
// react. This function can still be
// accessed by the map
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
    const [submitCommentLoading, setSubmitCommentLoading] = useState(false);
    const [totalCommentPages, setTotalCommentPages] = useState(0);
    const [currentCommentPage, setCurrentCommentPage] = useState(0);
    const [tags, setTags] = useState([]);
    const loggedInUser = useContext(UserContext);

    // reset the leaflet icon
    // as it cannot be accessed by the
    // react app once it has been built
    let DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    useEffect(() => {
        // update the name, aircraft position, and total comment pages
        // when the reg of the aircraft changes.
        setUser({ name: "Getting name..." })
        setAircraftPos([aircraft.location_lat, aircraft.location_lng]);
        setTotalCommentPages(0);
        handleGetTagNames();
    }, [aircraft.reg]);

    useEffect(() => {
        // update the user and comments when
        // the comments page changes.
        // run on first load as well
        getUserAndComments(aircraft.user_id);
    }, [currentCommentPage])

    const handleGetTagNames = async () => {
        const allTags = await getAllTags();
        const tags = await getAircraftTags(aircraft.id);
        const formattedTags = [];
        for (const tag of tags) {
            // for (const apiTag of allTags) {
            //     if (apiTag.id === tag.tag_id) {
            //         formattedTags.push(apiTag)
            //     }
            // }
            formattedTags.push(allTags.filter((tagElement) => tagElement.id === tag.tag_id)[0]);
        }
        setTags(formattedTags);
    }

    const submitComment = (e) => {
        e.preventDefault();
        setSubmitCommentLoading(true);

        addComment(comment, aircraft, loggedInUser.id).then((res) => {
            const newComment = { content: comment, author: loggedInUser.name, author_id: loggedInUser.id, date: new Date(), id: res }
            setComments([newComment, ...comments])
            setSubmitCommentLoading(false);
            setComment("");
        }).catch((e) => {
            console.log(e);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not post a comment.",
                footer: "If this continues, please contact the web administrator.",
            })
            setSubmitCommentLoading(false);
        })
    }

    const getUserAndComments = async (user_id = 0) => {
        setCommentsLoading(true);
        setComments([]);
        try {
            // get the user if it hasn't been done already
            if (!user.name || !user.id) {
                const aircraftOwner = await get(`/api/profile/${user_id}`);
                setUser(aircraftOwner);
                setKnownUsers({ ...knownUsers, [aircraftOwner.id]: aircraftOwner.name })
            }

            const comments = await get(`/api/comments/${currentCommentPage + 1}?aircraftId=${aircraft.id}`);

            // go through each comment and get the user who made the comment
            for (let i = 0; i < comments.payload.length; i++) {
                if (Object.keys(knownUsers).includes(comments.payload[i].author_id)) {
                    comments.payload[i].author = knownUsers[comments.payload[i].author_id];
                } else {
                    const commentUser = await get(`/api/profile/${comments.payload[i].author_id}`);
                    comments.payload[i].author = commentUser.name;
                    setKnownUsers({ ...knownUsers, [comments.payload[i].author_id]: commentUser.name })
                }
            }

            // determine the number of comment pages required
            // always have at least 1
            let numCommentPages = Math.ceil(comments.totalComments / comments.commentsPerPage)
            if (numCommentPages === 0) {
                numCommentPages = 1;
            }
            setTotalCommentPages(numCommentPages);
            setComments(comments.payload);
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

                // if the last comment on a page is deleted, and
                // we are not on the first page, then move back
                // one page
                let willMovePage = false;
                if (comments.length < 2 && currentCommentPage !== 0) {
                    willMovePage = true;
                }
                await deleteComment(commentId).then(() => {
                    const newComments = comments.filter((comment) => comment.id != commentId)
                    setComments(newComments);
                    if (willMovePage) {
                        setCurrentCommentPage(currentCommentPage - 1);
                    }
                }).catch(() => [
                    Swal.fire({
                        icon: "error",
                        title: "Error!",
                        text: "Could not remove comment."
                    })
                ])
            }
        })
    }

    return (
        <>
            <div className={`rounded-lg w-full max-w-screen-lg mx-10 overflow-scroll bg-op-card p-3 mb-5 ${className}`}>
                <div className="flex justify-center">
                    <img className="rounded-lg" src={aircraft.featured_photo_url}></img>
                </div>
                <div className="text-center items-center my-3">
                    <p className="uppercase text-5xl mb-1">{aircraft.reg}</p>
                    {user.name && user.id ?
                        <p className="">Submitted by: <a href={`/profile/${user.id}`} className="underline text-white">{user.name}</a></p>
                        :
                        <p className="">Submitted by: Getting name...</p>
                    }
                    <p>
                        <span className="me-2">Tags:</span>
                        {tags.length > 0
                            ?
                            tags.map((tag, index) => {
                                return (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{tag.name}</span>
                                )
                            })
                            :
                            <span>Loading...</span>
                        }
                    </p>

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
                                                    <Comment key={index} comment={comment} deleteComment={handleCommentDelete} formatOption={1}></Comment>
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
                                        className={`mt-1 block w-full bg-op-darkblue max-h-40 min-h-fit ${commentsLoading ? "hidden" : ""}`}
                                        isFocused={true}
                                        placeholder="Enter comment..."
                                        required
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <div className={`flex justify-between mt-2 max-w-full ${commentsLoading ? "hidden" : ""}`}>
                                        <div className={`flex flex-wrap gap-2`}>
                                            <PrimaryButtonEvent type="button" disabled={currentCommentPage === 0 || totalCommentPages === 0} onClick={(() => {
                                                setCurrentCommentPage(0);
                                            })}>{"<<"}</PrimaryButtonEvent>
                                            {[...Array(totalCommentPages)].map((_, index) => {
                                                return (
                                                    <PrimaryButtonEvent key={index} disabled={currentCommentPage === index} type="button" onClick={(() => {
                                                        setCurrentCommentPage(index);
                                                    })}>{index + 1}</PrimaryButtonEvent>
                                                )
                                            })}

                                            <PrimaryButtonEvent disabled={currentCommentPage === totalCommentPages - 1 || totalCommentPages === 0} type="button" onClick={(() => {
                                                setCurrentCommentPage(totalCommentPages - 1);
                                            })}>{">>"}</PrimaryButtonEvent>
                                        </div>
                                        <div className="flex justify-end ms-10">
                                            <PrimaryButton disabled={submitCommentLoading}>Submit</PrimaryButton>
                                        </div>
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
