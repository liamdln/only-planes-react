import { getProfileName } from "@/utils/profile";
import React, { createContext, useEffect, useState } from "react";

// getter
const UserContext = createContext({});

// setter
const UserDispatchContext = createContext(undefined);

function UserProvider({ user, children }) {

    useEffect(() => {
        getUserName()
    }, [user])

    // provides user info to any page or component if
    // the page or component adds a user context layer
    // or if the page or component is a child of a page
    // or component using the user context layer.

    const [userDetails, setUserDetails] = useState({ name: "Loading..." })

    const getUserName = async () => {
        const profile = await getProfileName(user.id);
        console.log(profile);
        setUserDetails(profile);
    }

    return (
        <UserContext.Provider value={userDetails}>
            <UserDispatchContext.Provider value={setUserDetails}>
                { children }
            </UserDispatchContext.Provider>
        </UserContext.Provider>
    )
}

export { UserProvider, UserContext, UserDispatchContext };
