import { get } from "@/api";

export async function getProfileName(id) {
    return await get(`/api/profile/${id}`).then((res) => {
        return res;
    })
}
