import DangerButtonEvent from "@/Components/DangerButtonEvent";
import { UserProvider } from "@/Contexts/UserContext";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { deleteNotification } from "@/utils/notifications";
import { Head } from "@inertiajs/react";
import moment from "moment";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";


export default function Notifications({ auth, notifications }) {

    moment().local("en-gb");
    const [notificationsList, setNotificationsList] = useState([]);

    useEffect(() => {
        setNotificationsList(notifications);
    }, [notifications])

    const removeNotification = async (notification) => {
        await deleteNotification(notification.id).then(() => {
            setNotificationsList(notificationsList.filter((notificationInState) => notificationInState.id != notification.id));
        }).catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Could not delete notification."
            })
        })
    }

    return (
        <UserProvider user={auth.user}>
            <AuthenticatedLayout >
                <Head title="Notifications"></Head>
                <div className="text-center">
                    <div>
                        <p className="uppercase text-5xl mb-1">Notifications</p>
                        <hr className="w-48 h-1 mx-auto bg-op-primary border-0 rounded my-3" />
                    </div>
                    <div className="flex justify-center">
                        {

                            notificationsList.length < 1 ?
                                <>
                                    <em>No new notifications.</em>
                                </>
                                :
                                <>
                                    <div className="flex flex-col gap-3 mb-10">
                                        {
                                            notificationsList.map((notification, index) => {
                                                if (notification.notifiable === "opinion") {
                                                    return (
                                                        <div key={index} className={`bg-op-card rounded p-3`}>
                                                            <div>
                                                                <a className="underline" href={`/profile/${notification.sender.id}`}>{notification.sender.name}</a>
                                                                <strong className={`${notification.notifiable_content.opinion === "like" ? "text-green-500" : "text-red-500"} px-2`}>
                                                                    {notification.notifiable_content.opinion === "like" ? "liked" : "disliked"}
                                                                </strong>
                                                                <a href={`/aircraft/${notification.aircraft.id}`} className="uppercase underline">{notification.aircraft.reg}</a>
                                                            </div>
                                                            <p className="text-op-card-secondary mb-3"><em> - {moment(notification.date).calendar()}</em></p>
                                                            <DangerButtonEvent onClick={() => removeNotification(notification)}>Delete</DangerButtonEvent>
                                                        </div>
                                                    )
                                                } else {
                                                    return (
                                                        <div key={index} className={`bg-op-card rounded p-3`}>
                                                            <div>
                                                                <a className="underline" href={`/profile/${notification.sender.id}`}>{notification.sender.name}</a>
                                                                <strong className={`text-op-primary px-2`}>
                                                                    commented on
                                                                </strong>
                                                                <a href={`/aircraft/${notification.aircraft.id}`} className="uppercase underline">{notification.aircraft.reg}</a>
                                                                <br />
                                                                <p className="text-white"><em>"{notification.notifiable_content.content}"</em></p>
                                                            </div>
                                                            <p className="text-op-card-secondary mb-3"><em> - {moment(notification.date).calendar()}</em></p>
                                                            <DangerButtonEvent onClick={() => removeNotification(notification)}>Delete</DangerButtonEvent>
                                                        </div>
                                                    )
                                                }
                                            })
                                        }
                                    </div>
                                </>
                        }
                    </div>
                </div>
            </AuthenticatedLayout>
        </UserProvider >
    )

}
