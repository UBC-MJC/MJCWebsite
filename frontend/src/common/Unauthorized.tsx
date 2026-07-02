import { Link as RouterLink } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div>
            <h1>Unauthorized</h1>
            <p>
                You do not have permission to access this page. This may be because you are not
                logged in or your account lacks the required permissions.
            </p>
            <p>
                Please log in with an account that has the necessary access rights.
                If you believe this is an error, contact your administrator.
            </p>
            <RouterLink to="/">Return to Home</RouterLink>
        </div>
    );
};

export default Unauthorized;
