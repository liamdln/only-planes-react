import { httpDelete } from "@/api";
import Swal from "sweetalert2";

export async function removeOpinion(aircraftId) {
    await httpDelete(`/interactions?aircraftId=${aircraftId}`).catch((err) => {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Could not remove aircraft."
        })
    })
}
