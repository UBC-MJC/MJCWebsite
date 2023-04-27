import React, {FC, ReactNode} from "react";
import {Button} from "react-bootstrap";
import "./IconButton.css"

interface IconButtonProps {
    children: ReactNode
    disabled?: boolean
    onClick?: () => void
}
const IconButton:FC<IconButtonProps> = ({children, disabled = false, onClick}) => {
    return (
        <Button variant="link" className="d-inline-flex align-items-center text-dark icon-button" disabled={disabled} onClick={onClick}>
            {children}
        </Button>
    )
}

export default IconButton;
