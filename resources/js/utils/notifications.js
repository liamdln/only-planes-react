import { httpDelete, post } from "@/api";

export async function deleteNotification(notificationId) {
    return await httpDelete(`/api/notifications?notificationId=${notificationId}`)
}

export async function addNotification(senderId, recipientId, aircraftId, notifiableId, notifiableType) {
    return await post(`/api/notifications`, {
        senderId,
        recipientId,
        aircraftId,
        notifiableId,
        notifiableType
    })
}
