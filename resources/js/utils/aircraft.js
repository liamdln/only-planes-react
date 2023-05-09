import { httpDelete, post } from "@/api";

export function removeAircraft(aircraftId) {
    return new Promise((resolve, reject) => {
        httpDelete(`/api/aircraft/delete?aircraftId=${aircraftId}`).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject(err);
        })
    })
}

export function editAircraft(id, formData) {
    return new Promise((resolve, reject) => {
        post(`/api/aircraft/edit?aircraftId=${id}`, formData).then((res) => {
            resolve(res);
        }).catch((err) => {
            console.log("ERROR");
            reject(err);
        })
    })
}

export function addAircraft(formData) {
    return new Promise((resolve, reject) => {
        post("/api/aircraft/create", formData).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject(err);
        })
    })
}
