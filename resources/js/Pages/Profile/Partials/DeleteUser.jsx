import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { httpDelete } from "@/api";
import { useState } from "react";
import Swal from "sweetalert2";

export default function DeleteUser({ className = '', user }) {

    const [loading, setLoading] = useState(false);
    const [confirmUserDelete, setConfirmingUserDelete] = useState(false);

    const showDeleteModal = () => {
        setConfirmingUserDelete(true);
    };

    const closeModal = () => {
        setConfirmingUserDelete(false);
    };

    const deleteUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        await httpDelete(`/api/user/delete?userId=${user.id}`).then((res) => {
            setLoading(false);
            Swal.fire({
                icon: "success",
                text: "User has been deleted."
            }).then(() => {
                document.location.href = "/";
            })
        }).catch((err) => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not delete user."
            })
            setLoading(false);
        })
    }

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Delete Account</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Deleting an account will prevent the user from logging in, and delete all
                    the content that they have uploaded to the website.
                </p>
            </header>

            <DangerButton onClick={() => showDeleteModal()}>Delete { user.name || "Account" }</DangerButton>

            <Modal show={confirmUserDelete} onClose={() => closeModal()}>
                <form onSubmit={(e) => deleteUser(e)} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete { user.name || "this account" }?
                    </h2>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => closeModal()}>Cancel</SecondaryButton>

                        <DangerButton className="ml-3" disabled={loading}>
                            Delete {user.name || "Account"}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
