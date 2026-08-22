import {
    Container,
    Typography,
    Stack,
    Button,
    Box,
    Alert,
} from "@mui/material";
import { AuthContext } from "@/common/AuthContext";
import { useContext } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { responsiveDataGridContainer } from "@/theme/utils";
import { useCheckedInPlayers, useCheckInAction, useCheckInStatus } from "@/hooks/CheckInHooks";

const CheckIn = () => {
    const { player, loading } = useContext(AuthContext);
    const { data: checkedInPlayers = [] } = useCheckedInPlayers();
    const {
        data: checkedIn = false,
        isLoading: statusLoading,
    } = useCheckInStatus(!loading && !!player);
    const { checkIn, checkOut } = useCheckInAction();

    return (
        <Container>
            <Typography variant="h1">Daily Check-In</Typography>
            <Stack spacing={2}>
                {!loading && player && (
                    <Container>
                        <Box sx={{ "& > button": { m: 1 } }}>
                            <Button
                                size="large"
                                variant="contained"
                                onClick={() => checkIn.mutate()}
                                disabled={checkedIn || statusLoading}
                            >
                                Check In
                            </Button>
                            <Button
                                size="large"
                                variant="outlined"
                                onClick={() => checkOut.mutate()}
                                disabled={!checkedIn || statusLoading}
                            >
                                Check Out
                            </Button>
                        </Box>
                    </Container>
                )}
                {!loading && !player && (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Alert severity="info" variant="outlined">
                            Login to check in/out.
                        </Alert>
                    </Box>
                )}
                <Box sx={responsiveDataGridContainer}>
                    <DataGrid
                        rows={checkedInPlayers}
                        columns={columns}
                        disableRowSelectionOnClick
                        disableColumnMenu
                        initialState={{
                            sorting: {
                                sortModel: [
                                    {
                                        field: "checkedInAt",
                                        sort: "desc",
                                    },
                                ],
                            },
                        }}
                        sx={{
                            "& .MuiDataGrid-row:hover": {
                                backgroundColor: "action.hover",
                            },
                        }}
                    />
                </Box>
            </Stack>
            <Typography variant="subtitle1" color="text.secondary">Status resets daily at 12:00 AM PDT</Typography>
        </Container>
    );
};

const columns: GridColDef[] = [
    {
        field: "username",
        headerName: "Player",
        flex: 1,
        minWidth: 120,
    },
    {
        field: "checkedInAt",
        headerName: "Check-in Time",
        flex: 1,
        minWidth: 120,
        type: "string",
        valueFormatter: (value) =>
            new Date(value).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            }),
    },
];

export default CheckIn;