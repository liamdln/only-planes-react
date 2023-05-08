import { httpDelete } from "@/api";

export async function removeOpinion(aircraftId) {
    return await httpDelete(`/interactions?aircraftId=${aircraftId}`);
}
