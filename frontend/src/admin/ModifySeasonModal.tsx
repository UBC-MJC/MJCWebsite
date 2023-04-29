import React, {FC, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";

type ModifySeasonModalProps = {
    show: boolean
    season: Season
    handleClose: () => void
    handleSubmit: (season: Season) => void
    actionString: string
}

const ModifySeasonModal: FC<ModifySeasonModalProps> = ({show, season, handleClose, handleSubmit, actionString}) => {
    const [seasonName, setSeasonName] = useState<string>(season.name);
    const [endDate, setEndDate] = useState<string>(season.endDate);

    const [errors, setErrors] = useState<any>({});

    const submitSeason = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const newErrors = findErrors();
        if (Object.keys(newErrors).length !== 0) {
            setErrors(newErrors);
            return;
        }

        // Adjust for timezone offset
        const newEndDate = new Date(endDate)
        const offset = newEndDate.getTimezoneOffset()
        const offsetEndDate = new Date(newEndDate.getTime() + (offset * 60 * 1000))

        const updatedSeason: Season = {
            ...season,
            name: seasonName,
            endDate: offsetEndDate.toISOString(),
        }

        handleSubmit(updatedSeason)
    }

    const findErrors = () => {
        const newErrors: any = {};
        if (!seasonName) {
            newErrors["seasonName"] = "Season name is required";
        }

        if (!endDate) {
            newErrors["endDate"] = "End date is required";
        } else if (new Date(endDate) < new Date()) {
            newErrors["endDate"] = "End date must be in the future";
        }

        return newErrors;
    }

    const onEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value)
    }

    const onClose = () => {
        setSeasonName(season.name)
        setEndDate(season.endDate)
        setErrors({})
        handleClose()
    }

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{actionString}</Modal.Title>
            </Modal.Header>
            <Form noValidate onSubmit={submitSeason}>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Season Name</Form.Label>
                        <Form.Control required
                                      size="lg"
                                      type="text"
                                      placeholder="Season Name"
                                      defaultValue={season.name}
                                      isInvalid={ !!errors.seasonName }
                                      onChange={(e) => setSeasonName(e.target.value)}/>
                        <Form.Control.Feedback type='invalid'>
                            { errors.seasonName }
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mt-4">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control size="lg"
                                      type="date"
                                      defaultValue={endDate.substring(0, 10)}
                                      isInvalid={ !!errors.endDate }
                                      onChange={onEndDateChange} />
                        <Form.Control.Feedback type='invalid'>
                            { errors.endDate }
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="primary" type="submit">{actionString}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ModifySeasonModal;
