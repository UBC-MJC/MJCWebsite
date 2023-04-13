import React from 'react';
import { Outlet } from 'react-router';
import NavBar from './NavBar';

const WithNav: React.FC = () => {
    return (
        <>
            <NavBar />
            <Outlet />
        </>
    );
}

export default WithNav;
