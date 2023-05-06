import ActionCard from "@/Components/ActionCard";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function UserProfile({ userDetails, userAircraft }) {

    return (
        <AuthenticatedLayout >
            <Head title="Profile" />
            <div className="max-w-6xl mx-auto">
                <div className="mb-5">
                    <p className="">Profile for</p>
                    <p className="uppercase text-5xl mb-1">{userDetails.name}</p>
                    <hr className="h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                </div>
                <div className="text-center">
                    <p className="text-xl mb-3">User's Aircraft</p>
                    <div className="flex flex-wrap justify-center gap-3 max-w-screen-xl mx-auto pb-10">
                        {userAircraft && userAircraft.length > 0 ?
                            userAircraft.map((aircraft, index) => {

                                return (
                                    <ActionCard key={index} aircraft={aircraft} showActionDate={false} allowRemoval={false}></ActionCard>
                                )

                            })
                            :
                            <p><em>User has not submitted any aircraft.</em></p>
                        }
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    )

}
