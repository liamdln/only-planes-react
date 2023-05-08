import { UserContext } from "@/Contexts/UserContext";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import Modal from "./Modal";
import PrimaryButtonEvent from "./PrimaryButtonEvent";
import TextArea from "./TextArea";
import DangerButtonEvent from "./DangerButtonEvent";
import Swal from "sweetalert2";
import { editComment } from "@/utils/comments";

export default function Comment({ comment, deleteComment, formatOption = 1, resetComment }) {

    // format options:
    // 1:
    // content
    // - author, date

    // 2:
    // Author commented
    // content
    // on aircraft reg on date

    const user = useContext(UserContext)
    const [commentContent, setCommentContent] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [updatingComment, setUpdatingComment] = useState(false);

    useEffect(() => {
        setCommentContent(comment.content)
    }, [comment, showModal]);

    const updateComment = async () => {
        setUpdatingComment(true);
        if (!commentContent) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "The comment cannot be empty."
            })
            setUpdatingComment(false);
            return;
        }
        await editComment(comment.id, commentContent).catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "The comment could not be updated."
            })
        });
        comment.content = commentContent;
        // resetComment(comment)
        setUpdatingComment(false);
        setShowModal(false);
    }

    return (
        <>
            <Modal show={showModal}>
                <div className="p-3 bg-op-darkblue text-white">
                    <div className="text-center">
                        <span className="text-xl">Edit Comment</span>
                        <hr className="w-48 h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                    </div>
                    <TextArea
                        id="comment"
                        type="text"
                        name="comment"
                        className="mt-1 block w-full bg-op-card max-h-40 min-h-fit"
                        isFocused={true}
                        required
                        placeholder="Enter comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 items-center mt-2">
                        <DangerButtonEvent onClick={() => setShowModal(false)}>Close</DangerButtonEvent>
                        <PrimaryButtonEvent disabled={updatingComment} onClick={() => updateComment()}>Update</PrimaryButtonEvent>
                    </div>
                </div>
            </Modal>
            <div className={`${formatOption === 1 ? "bg-op-darkblue" : "bg-op-card"} rounded mb-3 p-3 flex justify-between`}>
                <div className="text-start overflow-scroll">
                    {formatOption === 1 ?
                        <>
                            <div className="max-w-full">{comment.content}</div>
                            <div className="text-op-card-secondary">
                                <em>
                                    - <a className="underline" href={`/profile/${comment.author_id}`}> {comment.author || comment.author_id}</a>, {moment(comment.date).calendar()}
                                </em>
                            </div>
                        </>

                        :
                        <>
                            <div className="text-op-card-secondary">
                                <em>
                                    {comment.authorName} commented
                                </em>
                            </div>
                            <div className="max-w-full">{comment.content}</div>
                            <div className="text-op-card-secondary">
                                <em>
                                    on <a className="underline uppercase" href={`/aircraft/${comment.aircraft_id}`}>{comment.aircraft_reg}</a> on {moment(comment.date).calendar()}
                                </em>
                            </div>
                        </>
                    }

                </div>
                <div className="flex gap-3 justify-end ms-5 self-center">
                    <button type="button" onClick={() => setShowModal(true)} hidden={user.id !== comment.author_id}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                        </svg>
                    </button>
                    <button type="button" onClick={() => deleteComment(comment.id)} hidden={user.id !== comment.author_id && user.role !== "Admin"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    )

}
