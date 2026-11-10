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
import confirmDialog from "@/common/ConfirmationDialog";

const CheckIn = () => {
    const { player, loading } = useContext(AuthContext);
    const { data: checkedInPlayers = [] } = useCheckedInPlayers();
    const {
        data: checkedIn = false,
        isLoading: statusLoading,
    } = useCheckInStatus(!loading && !!player);
    const { checkIn, checkOut, resetCheckIns } = useCheckInAction();

    const handleResetCheckIns = async () => {
        const response = await confirmDialog("Are you sure you want to reset all check-ins?", {
            okText: "Reset",
            okButtonStyle: "error",
        });
        if (!response) {
            return;
        }
        resetCheckIns.mutate();
    }

    return (
        <Container>
            <Stack spacing={2}>
                <Typography variant="h1">Check-In</Typography>
                {!loading && player && (
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
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
                        {player.admin && (
                            <Button
                                size="large"
                                variant="outlined"
                                color="warning"
                                onClick={handleResetCheckIns}
                                disabled={false}
                            >
                                Manual Reset
                            </Button>
                        )}
                    </Stack>
                )}
                {!loading && !player && (
                    <Alert severity="info" variant="outlined">
                        Login to check in/out.
                    </Alert>
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
            <Typography variant="subtitle1" color="text.secondary">Check-in expires after 4 hours</Typography>
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