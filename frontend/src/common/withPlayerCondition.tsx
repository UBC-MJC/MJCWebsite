import React, { FC, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const withPlayerCondition = (
    Component: FC<any>,
    condition: (player: Player | undefined, props?: any) => boolean,
    redirectTo: string,
) => {
    return function InnerComponent(props: any) {
        const { player } = useContext(AuthContext);

        return condition(player, props) ? (
            <Component {...props} />
        ) : (
            <Navigate to={redirectTo} replace />
        );
    };
};

export { withPlayerCondition };
