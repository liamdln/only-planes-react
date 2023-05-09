import Modal from "@/Components/Modal";
import DangerButtonEvent from "@/Components/DangerButtonEvent";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButtonEvent from "@/Components/PrimaryButtonEvent";
import FileUploadInput from "./FileUpload";
import { useState } from "react";
import Swal from "sweetalert2";
import { post } from "@/api";
import { addAircraft, editAircraft } from "@/utils/aircraft";

export default function AddAircraftModal({ visibility, setVisibility, aircraft = {}, context }) {

    const aircraftImageTag = "aircraft_image"
    const [formState, setFormState] = useState({
        registration: aircraft.reg || "",
        make: aircraft.make || "",
        model: aircraft.model || "",
        lat: aircraft.location_lat || 0,
        lng: aircraft.location_lng || 0,
    })
    const [aircraftImage, setAircraftImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAircraftUpload = async () => {

        setLoading(true);

        const formData = new FormData();

        if (!formState.registration
            || !formState.make
            || !formState.model
            || formState.lat < -90
            || formState.lat > 90
            || formState.lng < -180
            || formState.lng > 180
            || (!aircraftImage && context === "Add")
        ) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not submit aircraft. You did not complete the form correctly.",
            })
            setLoading(false);
            return;
        }

        for (const key in formState) {
            formData.append(key, formState[key]);
        }

        if (context === "Edit") {
            if (aircraftImage) {
                formData.append(aircraftImageTag, aircraftImage);
                formData.append("imageAttached", true);
            }
            await editAircraft(aircraft.id, formData).then(() => {
                Swal.fire({
                    icon: "success",
                    text: "Aircraft has been updated.",
                }).then(() => {
                    window.location.reload(false);
                })
            }).catch(() => {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Could not edit aircraft."
                })
            })

        } else {
            formData.append(aircraftImageTag, aircraftImage);
            await addAircraft(formData).then((res) => {
                Swal.fire({
                    icon: "success",
                    text: "Aircraft has been added.",
                }).then(() => {
                    if (res.payload) {
                        document.location.href = `/aircraft/${res.payload}`;
                    } else {
                        window.location.reload(false);
                    }
                })
            }).catch(() => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "There was an error adding this aircraft. Ensure it does not already exist.",
                })
            })
        }
        setLoading(false);

    }

    return (
        <Modal show={visibility}>
            <div className="bg-op-card p-5 text-center">
                <div>
                    <h1 className="text-white text-xl">{context} Aircraft</h1>
                    <hr className="w-48 h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                    <div className="text-start pb-3">
                        <InputLabel htmlFor="reg" className="text-white">Registration</InputLabel>
                        <TextInput
                            id="reg"
                            required
                            className="w-full mt-1 block uppercase"
                            value={formState.registration}
                            onChange={(e) => setFormState({ ...formState, registration: e.target.value })}
                        />
                        <div className="flex my-3 gap-3">
                            <div>
                                <InputLabel htmlFor="make" className="text-white">Make</InputLabel>
                                <TextInput
                                    id="make"
                                    required
                                    className="mt-1 block w-full"
                                    value={formState.make}
                                    onChange={(e) => setFormState({ ...formState, make: e.target.value })}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="model" className="text-white">Model</InputLabel>
                                <TextInput
                                    id="model"
                                    required
                                    className="mt-1 block w-full"
                                    value={formState.model}
                                    onChange={(e) => setFormState({ ...formState, model: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex mb-3 gap-3">
                            <div>
                                <InputLabel htmlFor="lat" className="text-white">Image Latitude</InputLabel>
                                <TextInput
                                    id="lat"
                                    required
                                    className="mt-1 block w-full"
                                    type="number"
                                    step="0.01"
                                    value={formState.lat}
                                    onChange={(e) => setFormState({ ...formState, lat: e.target.value })}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="lng" className="text-white">Image Longitude</InputLabel>
                                <TextInput
                                    id="lng"
                                    required
                                    className="mt-1 block w-full"
                                    type="number"
                                    step="0.01"
                                    value={formState.lng}
                                    onChange={(e) => setFormState({ ...formState, lng: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="reg" className="text-white">{context === "Edit" ? "Change Image (optional)" : "Upload Image"}</InputLabel>
                            <FileUploadInput
                                setFiles={setAircraftImage}
                                inputName={aircraftImageTag}
                                accept="image/*"
                                footerText="PNG or JPG (MAX 512MB)." />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <PrimaryButtonEvent disabled={loading} onClick={() => handleAircraftUpload()}>{context} Aircraft</PrimaryButtonEvent>
                        <DangerButtonEvent onClick={() => setVisibility(false)}>Close</DangerButtonEvent>
                    </div>
                </div>
            </div>

        </Modal>
    )

}
