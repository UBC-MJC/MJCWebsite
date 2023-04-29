import React, {FC} from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'react-bootstrap';
import {confirmable, createConfirmation} from 'react-confirm';

const ConfirmationDialog: FC<any> = ({show, proceed, dismiss, cancel, confirmation, title,
                          okText, cancelText, okButtonStyle, cancelButtonStyle, ...options}) => {
    const header = title ? (
        <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
    ) : undefined;
    return (
        <Modal
            size="sm"
            show={show}
            onHide={() => proceed(false)}
            backdrop="static"
            centered
        >
            {header}
            <Modal.Body>{confirmation}</Modal.Body>
            <Modal.Footer>
                <Button
                    variant={cancelButtonStyle}
                    onClick={() => proceed(false)}
                >
                    {cancelText}
                </Button>
                <Button
                    variant={okButtonStyle}
                    onClick={() => proceed(true)}
                >
                    {okText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ConfirmationDialog.propTypes = {
    /** header title */
    title: PropTypes.string,
    confirmation: PropTypes.string, // arguments of your confirm function
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    okButtonStyle: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger',
        'warning', 'info', 'light', 'dark', 'link']),
    cancelButtonStyle: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger',
        'warning', 'info', 'light', 'dark', 'link']),
    show: PropTypes.bool, // from confirmable.
    proceed: PropTypes.func, // from confirmable.
    cancel: PropTypes.func, // from confirmable.
    dismiss: PropTypes.func, // from confirmable.
};

ConfirmationDialog.defaultProps = {
    title: undefined,
    confirmation: undefined,
    okText: 'OK',
    cancelText: 'Cancel',
    okButtonStyle: 'primary',
    cancelButtonStyle: 'secondary',
    show: undefined,
    proceed: undefined,
    cancel: undefined,
    dismiss: undefined,
};

const confirmLow = createConfirmation(confirmable(ConfirmationDialog));

const confirmDialog = (message: any, options = {}) => {
    return confirmLow(Object.assign({confirmation: message}, options));
};

export default confirmDialog;
