import AddAircraftModal from "@/Components/AddAircraftModal";
import DangerButtonEvent from "@/Components/DangerButtonEvent";
import PrimaryButtonEvent from "@/Components/PrimaryButtonEvent";
import Profile from "@/Components/Profile";
import { UserProvider } from "@/Contexts/UserContext";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { removeAircraft } from "@/utils/aircraft";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import Swal from "sweetalert2";


export default function Aircraft({ auth, aircraft }) {

    const [showModal, setShowModal] = useState(false);

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
                await removeAircraft(aircraft.id).then(() => {
                    document.location.href = "/";
                }).catch(() => {
                    Swal.fire({
                        icon: "error",
                        title: "Error!",
                        text: "Could not remove aircraft."
                    })
                })
            }
        })
    }

    const handleAircraftEdit = async () => {
        setShowModal(true);
    }

    return (
        <UserProvider user={auth.user}>
            <AuthenticatedLayout >
                <Head title={aircraft.reg.toUpperCase()}></Head>
                <AddAircraftModal visibility={showModal} setVisibility={setShowModal} aircraft={aircraft} context={ "Edit" } />
                <div className="w-full flex justify-center">
                    <Profile aircraft={aircraft}>
                        <div className="flex gap-3 justify-center">
                            <DangerButtonEvent onClick={() => handleDeleteAircraft()}>Delete Aircraft</DangerButtonEvent>
                            <PrimaryButtonEvent onClick={() => handleAircraftEdit()}>Edit Aircraft</PrimaryButtonEvent>
                        </div>
                    </Profile>
                </div>
            </AuthenticatedLayout>
        </UserProvider>
    )

}
