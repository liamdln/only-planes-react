import Modal from "@/Components/Modal";
import DangerButtonEvent from "@/Components/DangerButtonEvent";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButtonEvent from "@/Components/PrimaryButtonEvent";
import FileUploadInput from "./FileUpload";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { addAircraft, editAircraft } from "@/utils/aircraft";
import { getAircraftTags, getAllTags } from "@/utils/tag";

const AIRCRAFT_IMAGE_TAG = "aircraft_image"

export default function AddAircraftModal({ visibility, setVisibility, aircraft = {}, context }) {

    useEffect(() => {
        getTags();
    }, [visibility])

    const capitaliseFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const [formState, setFormState] = useState({
        registration: aircraft.reg || "",
        make: aircraft.make || "",
        model: aircraft.model || "",
        lat: aircraft.location_lat || 0,
        lng: aircraft.location_lng || 0,
    })

    const [aircraftImage, setAircraftImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagsCheckedState, setTagCheckedState] = useState({})

    const handleTagCheck = (id) => {
        const tagsState = !tagsCheckedState[id] || false;
        setTagCheckedState({ ...tagsCheckedState, [id]: tagsState })
    }

    const getTags = async () => {
        const tagsFromApi = await getAllTags();
        setTags(tagsFromApi);
        if (aircraft.id) {
            const tags = await getAircraftTags(aircraft.id);
            const aircraftTags = {}
            for (const tag of tags) {
                aircraftTags[tag.tag_id] = true;
            }
            setTagCheckedState(aircraftTags);
            console.log(tagsCheckedState)
        }
    }

    const handleAircraftUpload = async () => {
        setLoading(true);

        // pack the data into form data
        // so it can be sent with the
        // image
        const formData = new FormData();
        if (!formState.registration
            || !formState.make
            || !formState.model
            || formState.lat < -90
            || formState.lat > 90
            || formState.lng < -180
            || formState.lng > 180
            || (!aircraftImage && context === "Add")
            || !Object.values(tagsCheckedState).includes(true)
        ) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not submit aircraft. You did not complete the form correctly.",
            })
            setLoading(false);
            return;
        }

        // append the data from the form
        // currently in JSON format
        for (const key in formState) {
            formData.append(key, formState[key]);
        }

        // append tags
        const keys = Object.keys(tagsCheckedState);
        formData.append("tags", keys.filter((key) => tagsCheckedState[key] === true))
        console.log(formData);

        // determine whether this is an edit or a new aircraft
        if (context === "Edit") {
            if (aircraftImage) {
                // append the aircraft image if a new one
                // has been uploaded
                formData.append(AIRCRAFT_IMAGE_TAG, aircraftImage);
                formData.append("imageAttached", true);
            }
            await editAircraft(aircraft.id, formData).then(() => {
                Swal.fire({
                    icon: "success",
                    text: "Aircraft has been updated.",
                }).then(() => {
                    // reload to get new data
                    // could get the aircraft back from the
                    // endpoint and update?
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
            // add the image as it is required when
            // an aircraft is added.
            formData.append(AIRCRAFT_IMAGE_TAG, aircraftImage);
            await addAircraft(formData).then((res) => {
                Swal.fire({
                    icon: "success",
                    text: "Aircraft has been added.",
                }).then(() => {
                    // if an aircraft was created then
                    // go to its profile
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
                                inputName={AIRCRAFT_IMAGE_TAG}
                                accept="image/*"
                                footerText="PNG or JPG (MAX 512MB)." />
                        </div>
                        <div>
                            <InputLabel htmlFor="tag" className="text-white">Tags</InputLabel>
                            <div className="flex flex-wrap justify-start gap-3 mt-1">
                                {
                                    tags.map((tag, index) => {
                                        return (
                                            <div key={index} className="flex items-center mb-4">
                                                <input defaultChecked={ tagsCheckedState[tag.id] } onClick={() => handleTagCheck(tag.id)} id={ `${tag.name}-checkbox` } type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor={`${tag.name}-checkbox`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{tag.name}</label>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            {/* <select id="countries"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-1"
                                onChange={(e) => setFormState({ ...formState, tag: e.target.value })}
                                value={formState.tag}>
                                {
                                    tags.map((tag, index) => {
                                        return (
                                            <option key={index} value={tag.id}>{ tag.name }</option>
                                        )
                                    })
                                }
                            </select> */}

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
