import DangerButtonEvent from "@/Components/DangerButtonEvent";
import Profile from "@/Components/Profile";
import { UserProvider } from "@/Contexts/UserContext";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { removeAircraft } from "@/utils/aircraft";
import Swal from "sweetalert2";


export default function Aircraft({ auth, aircraft }) {

    const handleDeleteAircraft = async () => {
        Swal.fire({
            icon: "question",
            title: "Are you sure?",
            text: `Are you sure you want to delete ${aircraftReg.toUpperCase()}?`,
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonText: "Delete",
            denyButtonText: "Keep",
            confirmButtonColor: "#D50000",
            denyButtonColor: "#00C853"
        }).then(async (response) => {
            if (response.isConfirmed) {
                await removeAircraft(aircraft.id);
                document.location.href = "/";
            }
        })
    }

    return (
        <UserProvider user={auth.user}>
            <AuthenticatedLayout >
                <div className="w-full flex justify-center">
                    <Profile aircraft={aircraft}>
                        <div className="text-center">
                            <DangerButtonEvent onClick={() => handleDeleteAircraft()}>Delete</DangerButtonEvent>
                        </div>
                    </Profile>
                </div>
            </AuthenticatedLayout>
        </UserProvider>
    )

}
