import { httpDelete, post } from "@/api";
import { addNotification } from "./notifications";

export async function removeOpinion(aircraftId) {
    return await httpDelete(`/interactions?aircraftId=${aircraftId}`);
}

export async function addOpinion(userId, aircraft, opinion) {

    return await post("/api/opinions", { userId, aircraftId: aircraft.id, opinion }).then((res) => {
        addNotification(userId, aircraft.user_id, aircraft.id, res.payload, "opinion");
        return res.payload;
    })

}
