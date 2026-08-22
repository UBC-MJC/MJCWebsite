import { useSearchParams } from "react-router";
import { pageMeta } from "@/common/pageMeta";
import PasswordReset from "@/login/PasswordReset";

export const meta = () => pageMeta("Reset Password");

export default function PasswordResetRoute() {
    const [searchParams] = useSearchParams();

    return <PasswordReset playerId={searchParams.get("id")} token={searchParams.get("token")} />;
}
