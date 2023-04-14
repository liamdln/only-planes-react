import React, { createContext, useState } from "react";

// getter
const UserContext = createContext({});

// setter
const UserDispatchContext = createContext(undefined);

function UserProvider({ user, children }) {
    const [userDetails, setUserDetails] = useState(user)

    return (
        <UserContext.Provider value={userDetails}>
            <UserDispatchContext.Provider value={setUserDetails}>
                { children }
            </UserDispatchContext.Provider>
        </UserContext.Provider>
    )
}

export { UserProvider, UserContext, UserDispatchContext };
