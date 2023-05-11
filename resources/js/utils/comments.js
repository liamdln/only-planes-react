import { httpDelete, post } from "@/api"
import { addNotification } from "./notifications";

export async function deleteComment(commentId) {
    return await httpDelete(`/api/comments?commentId=${commentId}`);
}

export async function editComment(commentId, newContent) {
    return await post(`/api/comments/edit?commentId=${commentId}`, { content: newContent });
}

export async function addComment(comment, aircraft, userId) {
    return await post("/api/comments", { comment, aircraftId: aircraft.id }).then((res) => {
        addNotification(userId, aircraft.user_id, aircraft.id, res.payload, "comment");
        return res.payload;
    });
}
