const Unauthorized = () => {
    return (
        <div>
            <h1>Unauthorized</h1>
            <p>
                You do not have permission to access this page. This may be because you are not logged in or your account lacks the required permissions.
            </p>
            <ul>
                <li>Please log in with an account that has the necessary access rights.</li>
                <li>If you believe this is an error, contact your administrator.</li>
            </ul>
            <a href="/">Return to Home</a>
        </div>
    );
};

export default Unauthorized;
