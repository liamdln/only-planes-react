import moment from "moment/moment";
import 'moment/locale/en-gb';
import PrimaryButtonEvent from "./PrimaryButtonEvent";
import DangerButtonEvent from "./DangerButtonEvent";
import Swal from "sweetalert2";
import { httpDelete, get } from "@/api";
import { useContext, useState } from "react";
import { UserContext } from "@/Contexts/UserContext";
import Modal from "@/Components/Modal";
import Profile from "@/Components/Profile";

export default function ActionCard({ aircraft, actionDate, className = "", removeAircraft }) {

    moment().local("en-gb");
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [aircraftProfile, setAircraftProfile] = useState({});
    const user = useContext(UserContext);

    const deleteOpinion = async (aircraftId, aircraftReg) => {
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
                await httpDelete(`/interactions?userId=${user.id}&aircraftId=${aircraftId}`).then(() => {
                    removeAircraft(aircraftId)
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

    const viewAircraft = async (aircraftId) => {
        setModalLoading(true)
        await get(`/api/aircraft/${aircraftId}`)
            .then((res) => {
                setAircraftProfile(res[0]);
                setShowModal(true);
            }).catch(() => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Could not fetch aircraft. Please refresh.",
                    footer: "If this continues, please contact the web administrator.",
                })
            })
        setModalLoading(false);
    }

    return (
        <>
            <Modal className="text-white text-center flex justify-center max-h-full py-3" backgroundClass="bg-op-card" maxWidth="screen-xl" show={showModal}>
                <Profile aircraft={aircraftProfile}>
                    {modalLoading ? <p>Loading...</p> : <>
                        <DangerButtonEvent onClick={() => setShowModal(false)}>Close</DangerButtonEvent>
                    </>}
                </Profile>
            </Modal>

            <div className={className + "bg-op-card w-3/12 text-center pb-3 rounded-md"}>
                <img src={aircraft.featured_photo_url} className="w-fit rounded-md" />
                <p className="uppercase my-3 text-xl">{aircraft.reg}</p>
                <p className="mb-3">Liked {moment(actionDate).calendar()}</p>
                <div className="flex gap-3 justify-center">
                    <PrimaryButtonEvent onClick={() => { viewAircraft(aircraft.id) }}>View</PrimaryButtonEvent>
                    <DangerButtonEvent onClick={() => { deleteOpinion(aircraft.id, aircraft.reg) }}>Remove</DangerButtonEvent>
                </div>
            </div>
        </>

    )

}
