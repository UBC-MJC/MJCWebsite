import React, { FC, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const withPlayerCondition = <T extends object>(
    Component: FC<T>,
    condition: (player: Player | undefined, props: T) => boolean,
    redirectTo: string,
) => {
    return function InnerComponent(props: T) {
        const { player } = useContext(AuthContext);

        return condition(player, props) ? (
            <Component {...props} />
        ) : (
            <Navigate to={redirectTo} replace />
        );
    };
};

export { withPlayerCondition };
