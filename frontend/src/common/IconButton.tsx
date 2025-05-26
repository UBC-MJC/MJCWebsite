import React, { FC, ReactNode } from "react";
import { Button } from "@mui/material";

interface IconButtonProps {
    children: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
}
const IconButton: FC<IconButtonProps> = ({ children, disabled = false, onClick }) => {
    return (
        <Button
            // variant="link"
            
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </Button>
    );
};

export default IconButton;
