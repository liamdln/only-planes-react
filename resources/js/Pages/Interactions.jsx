import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { UserProvider } from "@/Contexts/UserContext";
import { Head } from '@inertiajs/react';
import ActionCard from "@/Components/ActionCard";
import { useState } from "react";
import Swal from "sweetalert2";
import { httpDelete } from "@/api";


export default function Interactions({ auth, type, aircraft }) {

    const [aircraftProfiles, setAircraftProfiles] = useState(aircraft || []);

    const capitaliseFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const removeAircraft = async (aircraftId, aircraftReg) => {
        await Swal.fire({
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
                await httpDelete(`/interactions?aircraftId=${aircraftId}`).then(() => {
                    setAircraftProfiles(aircraftProfiles.filter((aircraft) => aircraft.id != aircraftId));
                }).catch((err) => {
                    console.error(err);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Could not delete aircraft."
                    })
                })
            }
        })
    }

    return (
        <UserProvider user={auth.user}>
            <AuthenticatedLayout>
                <Head title="Interactions" />
                <h1 className="text-center text-2xl">{capitaliseFirstLetter(type)}</h1>
                <hr className="w-48 h-1 mx-auto bg-op-primary border-0 rounded mt-3 mb-5" />
                <div className="flex flex-wrap gap-3 justify-center max-w-screen-xl mx-auto pb-10">
                    {aircraftProfiles && aircraftProfiles.length > 0
                        ?
                        aircraftProfiles.map((element, index) => {
                            return (
                                <ActionCard key={index} aircraft={element} actionDate={element.action_dispatch_date} removeAircraft={removeAircraft }></ActionCard>
                            )
                        })
                        :
                        <p>No aircraft to display.</p>}

                </div>
            </AuthenticatedLayout>
        </UserProvider>
    )

}
