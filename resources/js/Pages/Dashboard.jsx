import { ActionButton } from "@/Components/ActionButton";
import PrimaryButton from "@/Components/PrimaryButton";
import Profile from "@/Components/Profile";
import { UserProvider } from "@/Contexts/UserContext";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { get, post } from "@/api";
import { Head } from '@inertiajs/react';
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const MAX_AIRCRAFT_PER_REQ = 5;
const MIN_AIRCRAFT_RES_PAGE = 1;

export default function Dashboard({ auth }) {

    const [loading, setLoading] = useState(true);
    const [aircraftResPage, setAircraftResPage] = useState(1);
    const [aircraftList, setAircraftList] = useState([]);
    const [currentAircraftIndex, setCurrentAircraftIndex] = useState(0);

    // run every time aircraftResPage changes
    useEffect(() => {
        setLoading(true);
        getAircraft();
        setAircraftList([]);
    }, [aircraftResPage])

    const getAircraft = async () => {
        await get(`/api/all-aircraft/${aircraftResPage}?avoid-user=${auth.user.id}`).then((res) => {
            // console.log(res);
            if (res.length < 1) {
                Swal.fire({
                    icon: "info",
                    title: "Sorry!",
                    text: "There are no more aircraft for you to see. Check back later.",
                }).then(() => {
                    setLoading(false);
                })
            } else {
                setLoading(false);
                setAircraftList(res);
                setCurrentAircraftIndex(0);
            }
        }).catch((err) => {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not fetch aircraft. Please refresh.",
                footer: "If this continues, please contact the web administrator.",
                confirmButtonText: "Refresh",
                showDenyButton: true,
                denyButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload(false);
                } else {
                    setLoading(false);
                }
            })
        })
    }

    const nextPage = () => {
        setLoading(true);
        setAircraftResPage(aircraftResPage + 1)
        setCurrentAircraftIndex(0);
    }

    const nextAircraft = () => {
        setLoading(true);
        if (currentAircraftIndex === MAX_AIRCRAFT_PER_REQ - 1 || currentAircraftIndex === (aircraftList.length - 1)) {
            nextPage();
        } else {
            setCurrentAircraftIndex(currentAircraftIndex + 1)
            setLoading(false);
        }
    }

    const postAction = async (opinion, aircraftId) => {
        const url = "/api/opinions";
        await post(url, { userId: auth.user.id, aircraftId, opinion }).then(() => nextAircraft()).catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Could not ${opinion} the aircraft.`,
                footer: "If this continues, please contact the web administrator.",
            })
        })
    }

    if (aircraftList.length < 1 && !loading) {
        return (
            <UserProvider user={auth.user}>
                <AuthenticatedLayout>
                    <div className="text-center">
                        <h1 className="text-2xl">Sorry...</h1>
                        <p>There are no more aircraft for you to see.</p>
                        <PrimaryButton className="mt-5" onClick={() => {
                            setAircraftResPage(MIN_AIRCRAFT_RES_PAGE);
                            setLoading(true);
                        }}>Refresh</PrimaryButton>
                    </div>
                </AuthenticatedLayout>
            </UserProvider>
        )
    }

    return (
        <UserProvider user={auth.user}>
            <AuthenticatedLayout>
                <Head title="Dashboard" />
                {/* height of div: 100vh - navbar height - navbar bottom margin */}
                <div className="flex justify-center" style={{ height: "calc(100vh - 64px - 20px)" }}>
                    <ActionButton disabled={ loading } type="dislike" onClick={() => postAction("dislike", aircraftList[currentAircraftIndex].id)}></ActionButton>
                    {loading
                        ?
                        <div className="max-w-screen-lg w-full flex justify-center items-center">
                            <div role="status">
                                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                            <span>Loading...</span>
                        </div>
                        :
                        <Profile
                            aircraft={aircraftList[currentAircraftIndex]}
                        >
                        </Profile>}
                    <ActionButton disabled={loading} type="like" onClick={() => postAction("like", aircraftList[currentAircraftIndex].id)}></ActionButton>
                </div>
            </AuthenticatedLayout>
        </UserProvider>
    );
}
