import { httpDelete } from "@/api"
import Swal from "sweetalert2"

export async function deleteComment(commentId) {
    await httpDelete(`/api/comments?commentId=${commentId}`)
        .catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not delete comment.",
                footer: "If this continues, please contact the web administrator.",
            })
        })

}

