import { useRef, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { post, put } from "@/api";
import Swal from "sweetalert2";

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [userPassword, setUserPassword] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    const [loading, setLoading] = useState(false);

    const updatePassword = async (e) => {
        e.preventDefault();

        setLoading(true);

        // ensure the new password matches the password in the confirm text box
        // and that it is not the same as the password in the current password text box.
        if (userPassword.newPassword === userPassword.confirmNewPassword && userPassword.currentPassword !== userPassword.newPassword) {
            await put(route("password.update"), {
                current_password: userPassword.currentPassword,
                password: userPassword.newPassword,
                password_confirmation: userPassword.confirmNewPassword
            }).then((res) => {
                Swal.fire({
                    icon: "success",
                    text: "Password has been updated."
                }).then(() => {
                    window.location.reload(false);
                })
                setLoading(false);
            }).catch((err) => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Could not update password: ${err.response.data.message || "Unknown Error"}`
                });
                setLoading(false);
            })
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Passwords do not match or the current password matches the new password."
            });
            setLoading(false);
        }

    };

    return (
        <section className={className + " text-gray-950"}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Update Password</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={userPassword.currentPassword}
                        onChange={(e) => setUserPassword({ ...userPassword, currentPassword: e.target.value })}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={userPassword.newPassword}
                        onChange={(e) => setUserPassword({ ...userPassword, newPassword: e.target.value })}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />

                    <TextInput
                        id="password_confirmation"
                        value={userPassword.confirmNewPassword}
                        onChange={(e) => setUserPassword({ ...userPassword, confirmNewPassword: e.target.value })}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                </div>

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
