import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { UserProvider } from "@/Contexts/UserContext";
import DeleteUser from "./Partials/DeleteUser";

export default function EditProfile({ auth, user = {}, admin = False }) {

    return (
        <UserProvider user={auth.user}>
            <AuthenticatedLayout>
                <Head title={user && user.id === auth.user.id ? "Your Profile" : `${user.name}'s Profile` } />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                            <UpdateProfileInformationForm
                                className="max-w-xl"
                                user={user}
                                loggedInUser={auth.user}
                                admin={ admin }
                            />
                        </div>

                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg" hidden={ auth.user.id !== user.id }>
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg" hidden={auth.user.id === user.id}>
                            <DeleteUser className="max-w-xl" user={user} />
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </UserProvider>

    );
}
