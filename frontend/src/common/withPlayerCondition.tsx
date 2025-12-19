import { ComponentType, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/common/AuthContext";
import LoadingFallback from "@/common/LoadingFallback";
import type { Player } from "@/types";

const withPlayerCondition = <T extends object>(
    Component: ComponentType<T>,
    condition: (player: Player | undefined, props: T) => boolean,
    redirectTo: string,
) => {
    return function InnerComponent(props: T) {
        const { player, loading } = useContext(AuthContext);

        // Wait for authentication check to complete before evaluating condition
        if (loading) {
            return <LoadingFallback message="Checking authentication..." />;
        }

        return condition(player, props) ? (
            <Component {...props} />
        ) : (
            <Navigate to={redirectTo} replace />
        );
    };
};

export { withPlayerCondition };
