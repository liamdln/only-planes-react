import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { UserProvider } from "@/Contexts/UserContext";
import { Head } from '@inertiajs/react';
import ActionCard from "@/Components/ActionCard";
import { useState } from "react";



export default function Interactions({ auth, type, aircraft }) {

    const [aircraftProfiles, setAircraftProfiles] = useState(aircraft || []);

    const capitaliseFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const removeAircraft = (aircraftId) => {
        setAircraftProfiles(aircraftProfiles.filter((aircraft) => aircraft.id != aircraftId));
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
                                <ActionCard key={index} aircraft={element} actionDate={element.action_dispatch_date} removeAircraft={ removeAircraft }></ActionCard>
                            )
                        })
                        :
                        <p>No aircraft to display.</p>}

                </div>
            </AuthenticatedLayout>
        </UserProvider>
    )

}
