import { useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import type { GameType, Season } from "@/types";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
        field: "type",
        headerName: "Type",
        flex: 1,
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
    const [type, setType] = useState<GameType>("RANKED");
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
    const handleCreate = (name: string, type: GameType, endDate?: Date) => {
        if (!name || !endDate) {
            logger.log("Error creating season: name or endDate is undefined");
            return;
        }
        const season: Omit<Season, "id"> = {
            name,
            type,
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
        const now = new Date();
        const currentSeasons = seasons.filter(
            (season) => season.startDate <= now && now < season.endDate,
        );
        return (
            <CardContent>
                <Stack spacing={2}>
                    {currentSeasons.length === 0 ? (
                        <Typography variant="body1">No active seasons</Typography>
                    ) : (
                        currentSeasons.map((season) => (
                            <Box key={season.id}>
                                <Typography variant="h3">{season.name}</Typography>
                                <Typography variant="body1">Type: {season.type}</Typography>
                                <Typography variant="body1">
                                    {season.startDate.toDateString()} –{" "}
                                    {season.endDate.toDateString()}
                                </Typography>
                            </Box>
                        ))
                    )}
                    <Button variant="contained" onClick={() => setShowCreateSeasonModal(true)}>
                        Create Season
                    </Button>
                </Stack>
            </CardContent>
        );
    }

    return (
        <Stack>
            <Card>
                <CardHeader title="Active Seasons" />
                {getCurrentSeasonPanel()}
            </Card>

            <Dialog open={showCreateSeasonModal} onClose={() => setShowCreateSeasonModal(false)}>
                <DialogTitle>Create Season</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            required
                            fullWidth
                            label="Season Name"
                            value={name}
                            error={!name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="season-type-label">Type</InputLabel>
                            <Select
                                labelId="season-type-label"
                                label="Type"
                                value={type}
                                onChange={(event) => setType(event.target.value as GameType)}
                            >
                                <MenuItem value="RANKED">Ranked</MenuItem>
                                <MenuItem value="PLAY_OFF">Playoff</MenuItem>
                                <MenuItem value="TOURNEY">Tournament</MenuItem>
                                <MenuItem value="CASUAL">Casual</MenuItem>
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                disablePast
                                onChange={setEndDate}
                            />
                        </LocalizationProvider>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCreateSeasonModal(false)}>Close</Button>
                    <Button onClick={() => handleCreate(name, type, endDate?.toDate())} autoFocus>
                        Create Season
                    </Button>
                </DialogActions>
            </Dialog>

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
