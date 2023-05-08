import { httpDelete, post } from "@/api";

export async function removeAircraft(aircraftId) {
    return await httpDelete(`/api/aircraft/delete?aircraftId=${aircraftId}`);
}

export async function editAircraft(id, formData) {
    return await post(`/api/aircraft/edit?aircraftId=${id}`, formData).then((res) => {
        return res.payload || res;
    });
}

export async function addAircraft(formData) {
    return await post("/api/aircraft/create", formData).then((res) => {
        return res.payload || res;
    });
}
