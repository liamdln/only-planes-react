import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { put } from "@/api";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function UpdateProfileInformation({ className = '', user, loggedInUser }) {

    const [userDetails, setUserDetails] = useState({ name: user.name, email: user.email });
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("");

    useEffect(() => {
        setRole(user.role);
    }, [user])

    const submit = async (e) => {
        e.preventDefault();

        // console.log(e.target.name.value);
        setLoading(true);

        await put(`/api/profile/edit/${user.id}`, { id: user.id, name: userDetails.name, email: userDetails.email, role: role }).then((res) => {
            Swal.fire({
                icon: "success",
                text: "User has been updated."
            }).then(() => {
                setLoading(false);
                window.location.reload(false);
            })
        }).catch((err) => {
            if (err.response.status === 304) {
                Swal.fire({
                    icon: "info",
                    text: "Nothing was changed."
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Could not update user."
                });
            }
            setLoading(false);
        })

    };

    return (
        <section className={className + " text-gray-950"}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={userDetails.name}
                        onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                        required
                        isFocused
                        autoComplete="name"
                    />

                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={userDetails.email}
                        onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                        required
                        autoComplete="username"
                    />

                </div>

                <div hidden={ loggedInUser.id === user.id || loggedInUser.role !== "Admin" }>
                    <InputLabel htmlFor="role" value="Role" />
                    <select id="countries"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        onChange={(e) => setRole(e.target.value)}
                        value={role}>
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                    </select>

                </div>

                {/* {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )} */}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={loading}>Save</PrimaryButton>

                    {/* <Transition
                        show={recentlySuccessful}
                        enterFrom="opacity-0"
                        leaveTo="opacity-0"
                        className="transition ease-in-out"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition> */}
                </div>
            </form>
        </section>
    );
}
