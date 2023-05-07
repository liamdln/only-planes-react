import { httpDelete } from "@/api";
import Swal from "sweetalert2";

export async function removeAircraft(aircraftId) {
    await httpDelete(`/api/aircraft/delete?aircraftId=${aircraftId}`)
        .catch((err) => {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not delete aircraft."
            })
        })
}
