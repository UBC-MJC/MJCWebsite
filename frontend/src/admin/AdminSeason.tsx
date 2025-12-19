import { useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import type { Season } from "@/types";
import { logger } from "@/common/logger";
import LoadingFallback from "@/common/LoadingFallback";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Stack,
} from "@mui/material";
import { useCreateSeasonMutation, useUpdateSeasonMutation, useSeasons } from "@/hooks/AdminHooks";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { responsiveDataGridContainer } from "@/theme/utils";

const playerColumns: GridColDef<Season>[] = [
    {
        field: "name",
        headerName: "Season Name",
        flex: 1,
        editable: true,
    },
    {
        field: "startDate",
        headerName: "Start Date",
        flex: 1,
        type: "date",
        editable: true,
    },
    {
        field: "endDate",
        headerName: "End Date",
        flex: 1,
        type: "date",
        editable: true,
    },
];
const AdminSeason = () => {
    const { player, loading } = useContext(AuthContext);

    // Call all hooks unconditionally at the top
    const [showCreateSeasonModal, setShowCreateSeasonModal] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(9, "weeks").add(5, "days"));
    const { isPending, error, data } = useSeasons();
    const createSeasonMut = useCreateSeasonMutation(player || undefined);
    const updateSeasonMut = useUpdateSeasonMutation(player || undefined);

    // Early return after all hooks
    if (loading) {
        return <LoadingFallback />;
    }

    if (!player) {
        return <>No player logged in</>;
    }
    const handleCreate = (name: string, endDate?: Date) => {
        if (!name || !endDate) {
            logger.log("Error creating season: name or endDate is undefined");
            return;
        }
        const season: Omit<Season, "id"> = {
            name,
            startDate: new Date(),
            endDate,
        };
        createSeasonMut.mutate(season);
        setShowCreateSeasonModal(false);
    };
    const updateSeason = (editedSeason: Season) => {
        if (typeof editedSeason === "undefined") {
            logger.log("Error updating season: editedSeason is undefined");
            return;
        }
        updateSeasonMut.mutate(editedSeason);
    };
    const seasons = data ?? [];

    if (isPending) {
        return <>Pending</>;
    }
    if (error) {
        return <>Error</>;
    }

    function getCurrentSeasonPanel() {
        if (seasons.length > 0 && new Date(seasons[0].endDate) > new Date()) {
            const currentSeason = seasons[0];
            return (
                <CardContent>
                    <Stack spacing={1}>
                        <Typography variant="h3">{currentSeason.name}</Typography>
                        <Typography variant="body1">
                            Start Date: {currentSeason.startDate.toDateString()}
                        </Typography>
                        <Typography variant="body1">
                            End Date: {currentSeason.endDate.toDateString()}
                        </Typography>
                    </Stack>
                </CardContent>
            );
        }

        return (
            <>
                <CardContent>
                    <Stack spacing={1}>
                        <Typography variant="body1">No current season</Typography>
                        <Button variant="contained" onClick={() => setShowCreateSeasonModal(true)}>
                            Create Season
                        </Button>
                    </Stack>
                </CardContent>
                <Dialog
                    open={showCreateSeasonModal}
                    onClose={() => setShowCreateSeasonModal(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle>Create Season</DialogTitle>
                    <DialogContent>
                        <TextField
                            required
                            fullWidth
                            margin="dense"
                            label="Season Name"
                            type="text"
                            value={name}
                            error={!name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                disablePast
                                onChange={(newValue) => setEndDate(newValue)}
                            />
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowCreateSeasonModal(false)}>Close</Button>
                        <Button onClick={() => handleCreate(name, endDate?.toDate())} autoFocus>
                            Create Season
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    return (
        <Stack>
            <Card>
                <CardHeader title="Current Season" />
                {getCurrentSeasonPanel()}
            </Card>

            <Typography variant="h2">All Seasons</Typography>

            <Box sx={responsiveDataGridContainer}>
                <DataGrid<Season>
                    columns={playerColumns}
                    rows={seasons}
                    processRowUpdate={(updatedRow, originalRow) => {
                        if (updatedRow === originalRow) {
                            return updatedRow;
                        }
                        updateSeason(updatedRow);
                        return updatedRow;
                    }}
                    editMode="row"
                />
            </Box>
        </Stack>
    );
};

export default AdminSeason;
