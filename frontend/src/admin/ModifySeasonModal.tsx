import React, { FC, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from "@mui/material";

interface ModifySeasonModalProps {
    show: boolean;
    season: Season;
    handleClose: () => void;
    handleSubmit: (season: Season) => void;
    actionString: string;
}

const ModifySeasonModal: FC<ModifySeasonModalProps> = ({
    show,
    season,
    handleClose,
    handleSubmit,
    actionString,
}) => {
    const [seasonName, setSeasonName] = useState<string>(season.name);
    const [endDate, setEndDate] = useState<string>(season.endDate);

    const [errors, setErrors] = useState<any>({});

    const submitSeason = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = findErrors();
        if (Object.keys(newErrors).length !== 0) {
            setErrors(newErrors);
            return;
        }

        // Adjust for timezone offset
        const newEndDate = new Date(endDate);
        const offset = newEndDate.getTimezoneOffset();
        const offsetEndDate = new Date(newEndDate.getTime() + offset * 60 * 1000);

        const updatedSeason: Season = {
            ...season,
            name: seasonName,
            endDate: offsetEndDate.toISOString(),
        };

        handleSubmit(updatedSeason);
    };

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
    };

    const onEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const onClose = () => {
        setSeasonName(season.name);
        setEndDate(season.endDate);
        setErrors({});
        handleClose();
    };

    return (
        <Dialog open={show} onClose={onClose}>
            <DialogTitle>{actionString}</DialogTitle>
            <form noValidate onSubmit={submitSeason}>
                <DialogContent>
                    <TextField
                        required
                        fullWidth
                        margin="dense"
                        label="Season Name"
                        type="text"
                        value={seasonName}
                        error={!!errors.seasonName}
                        helperText={errors.seasonName}
                        onChange={(e) => setSeasonName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="End Date"
                        type="date"
                        value={endDate.substring(0, 10)}
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                        onChange={onEndDateChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Close
                    </Button>
                    <Button type="submit" color="primary">
                        {actionString}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ModifySeasonModal;
