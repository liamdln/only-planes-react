import ActionCard from "@/Components/ActionCard";
import PrimaryButtonEvent from "@/Components/PrimaryButtonEvent";
import { UserProvider } from "@/Contexts/UserContext";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { get } from "@/api";
import { Head } from '@inertiajs/react';
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { deleteComment } from "@/utils/comments";
import { removeAircraft } from "@/utils/aircraft";
import Comment from "@/Components/Comment";

export default function UserProfile({ auth, userDetails, userAircraft, userComments }) {

    const [allowRemoval, setAllowRemoval] = useState(false);
    const [aircraftProfiles, setAircraftProfiles] = useState(userAircraft || []);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [knownRegs, setKnownRegs] = useState({});

    useEffect(() => {
        setAllowRemoval(auth.user.role === "Admin" || auth.user.id === userDetails.id);
        formatComments();
    }, [userDetails]);

    const handleDeleteAircraft = async (aircraftId, aircraftReg) => {
        Swal.fire({
            icon: "question",
            title: "Are you sure?",
            text: `Are you sure you want to delete ${aircraftReg.toUpperCase()}?`,
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: "Delete",
            denyButtonText: "Keep",
            confirmButtonColor: "#D50000",
            denyButtonColor: "#00C853"
        }).then(async (response) => {
            if (response.isConfirmed) {
                await removeAircraft(aircraftId).then(() => {
                    setAircraftProfiles(aircraftProfiles.filter((aircraft) => aircraft.id != aircraftId));
                }).catch(() => {
                    Swal.fire({
                        icon: "error",
                        title: "Error!",
                        text: "Could not remove aircraft."
                    })
                })
            }
        })

    }

    const formatComments = async () => {
        setCommentsLoading(true);
        // append the aircraft details to each comment
        const commentsFromDb = userComments;
        for (let i = 0; i < commentsFromDb.length; i++) {
            commentsFromDb[i].authorName = userDetails.name;
            if (Object.keys(knownRegs).includes(commentsFromDb[i].aircraft_id)) {
                commentsFromDb[i].aircraft_reg = knownRegs[commentsFromDb[i].aircraft_id];
            } else {
                const commentReg = await get(`/api/aircraft/${commentsFromDb[i].aircraft_id}`);
                commentsFromDb[i].aircraft_reg = commentReg[0].reg;
                setKnownRegs({ ...knownRegs, [commentsFromDb[i].aircraft_id]: commentReg[0].reg })
            }
        }
        setComments(commentsFromDb);
        setCommentsLoading(false);
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
                await deleteComment(commentId).then(() => {
                    setComments(comments.filter((comment) => comment.id != commentId));
                }).catch(() => {
                    Swal.fire({
                        icon: "error",
                        title: "Error!",
                        text: "Could not remove comment."
                    })
                })

            }
        })
    }

    return (
        <UserProvider user={auth.user}>
            <AuthenticatedLayout >
                <Head title="Profile" />
                <div className="max-w-6xl mx-auto">
                    <div className="mb-5 flex justify-between">
                        <div>
                            <p className="">Profile for</p>
                            <p className="uppercase text-5xl mb-1">{userDetails.name}</p>
                        </div>
                        <div className="self-center">
                            {auth.user.role === "Admin" || auth.user.id === userDetails.id ?
                                <PrimaryButtonEvent onClick={() => document.location.href = `/profile/edit/${userDetails.id}`}>Edit Profile</PrimaryButtonEvent>
                                :
                                <></>
                            }

                        </div>
                    </div>
                    <hr className="h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                    <div className="text-center">
                        <p className="text-xl mb-3">{auth.user.id === userDetails.id ? "Your Aircraft" : "User's Aircraft"}</p>
                        <div className="flex flex-wrap justify-center gap-3 max-w-screen-xl mx-auto pb-10">
                            {aircraftProfiles && aircraftProfiles.length > 0 ?
                                aircraftProfiles.map((aircraft, index) => {
                                    return (
                                        <ActionCard key={index} aircraft={aircraft} showActionDate={false} removeAircraft={handleDeleteAircraft} allowRemoval={allowRemoval}></ActionCard>
                                    )

                                })
                                :
                                <p><em>User has not submitted any aircraft.</em></p>
                            }
                        </div>

                    </div>
                    <div className="text-center pb-16">
                        <p className="text-xl mb-3">{auth.user.id === userDetails.id ? "Your Comments" : "User's Comments"}</p>
                        <div hidden={commentsLoading}>
                            {comments && comments.length > 0 ?
                                comments.map((comment, index) => {
                                    return (
                                        <Comment key={index} comment={comment} deleteComment={handleCommentDelete} formatOption={2}></Comment>
                                    )
                                })
                                :
                                <div className="text-center text-op-card-secondary"><em>No comments.</em></div>}
                        </div>
                        <div className="text-center" hidden={!commentsLoading}>
                            <div className="w-full flex justify-center items-center">
                                <div role="status">
                                    <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <span>Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </UserProvider>
    )

}
