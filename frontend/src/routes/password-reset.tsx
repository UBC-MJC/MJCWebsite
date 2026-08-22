import { useSearchParams } from "react-router";
import PasswordReset from "@/login/PasswordReset";

export default function PasswordResetRoute() {
    const [searchParams] = useSearchParams();

    return <PasswordReset playerId={searchParams.get("id")} token={searchParams.get("token")} />;
}
