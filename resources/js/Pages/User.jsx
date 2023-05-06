import ActionCard from "@/Components/ActionCard";
import PrimaryButtonEvent from "@/Components/PrimaryButtonEvent";
import { UserProvider } from "@/Contexts/UserContext";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { httpDelete } from "@/api";
import { Head } from '@inertiajs/react';
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function UserProfile({ auth, userDetails, userAircraft }) {

    const [allowRemoval, setAllowRemoval] = useState(false);
    const [aircraftProfiles, setAircraftProfiles] = useState(userAircraft || []);

    useEffect(() => {
        setAllowRemoval(auth.user.role === "Admin" || auth.user.id === userDetails.id);
    }, [userDetails]);

    const deleteAircraft = async (aircraftId, aircraftReg) => {
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
                await httpDelete(`/api/aircraft/delete?aircraftId=${aircraftId}`).then(() => {
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
            <AuthenticatedLayout >
                <Head title="Profile" />
                <div className="max-w-6xl mx-auto">
                    <div className="mb-5 flex justify-between">
                        <div>
                            <p className="">Profile for</p>
                            <p className="uppercase text-5xl mb-1">{userDetails.name}</p>
                        </div>
                        <div className="self-center">
                            {auth.user.role === "Admin" || auth.user.id === userDetails.id ?
                                <PrimaryButtonEvent onClick={() => document.location.href = `/profile/edit/${userDetails.id}`}>Edit Profile</PrimaryButtonEvent>
                                :
                                <></>
                            }

                        </div>
                    </div>
                    <hr className="h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                    <div className="text-center">
                        <p className="text-xl mb-3">{auth.user.id === userDetails.id ? "Your Aircraft" : "User's Aircraft" }</p>
                        <div className="flex flex-wrap justify-center gap-3 max-w-screen-xl mx-auto pb-10">
                            {aircraftProfiles && aircraftProfiles.length > 0 ?
                                aircraftProfiles.map((aircraft, index) => {
                                    return (
                                        <ActionCard key={index} aircraft={aircraft} showActionDate={false} removeAircraft={deleteAircraft} allowRemoval={allowRemoval}></ActionCard>
                                    )

                                })
                                :
                                <p><em>User has not submitted any aircraft.</em></p>
                            }
                        </div>

                    </div>
                </div>
            </AuthenticatedLayout>
        </UserProvider>
    )

}
