import { get } from "@/api";

export async function getTagName(id) {
    return await get(`/api/tag?id=${id}`).then((res) => {
        return res.payload;
    })
}

export async function getAllTags() {
    return await get(`/api/tags`).then((res) => {
        return res.payload;
    })
}

export async function getAircraftTags(aircraftId) {
    return await get(`/api/tags/for?aircraftId=${aircraftId}`).then((res) => {
        return res.payload;
    })
}
