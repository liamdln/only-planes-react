import { httpDelete, post } from "@/api"

export async function deleteComment(commentId) {
    return await httpDelete(`/api/comments?commentId=${commentId}`);
}

export async function editComment(commentId, newContent) {
    return await post(`/api/comments/edit?commentId=${commentId}`, { content: newContent });
}
