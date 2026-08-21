import {
    checkInAPI,
    checkOutAPI,
    getCheckedInPlayersAPI,
    getStatusAPI
} from "@/api/CheckInAPI";
import {
    Container,
    Typography,
    Stack,
    Button,
    Box,
    Alert,
} from "@mui/material";
import { AuthContext } from "@/common/AuthContext";
import { useEffect, useState, useContext } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { responsiveDataGridContainer } from "@/theme/utils";


const CheckIn = () => {

    const [checkedIn, setCheckedIn] = useState(true);
    const [checkedInPlayers, setCheckedInPlayers] = useState<{ id: string; username: string; checkedInAt: string }[]>([]);
    const { player, loading } = useContext(AuthContext);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
        const loadCheckInData = async () => {
            try {
                await loadCheckedInPlayers();

                if (player) {
                    const statusResponse = await getStatusAPI();
                    setCheckedIn(statusResponse.data.checkedInAt !== null);
                }
            } catch (err) {
                console.error("Failed to load check-in status:", err);
            } finally {
                setStatusLoading(false);
            }
        };
        if (!loading) {
            loadCheckInData();
        }
    }, [loading, player]);

    const handleCheckIn = async () => {
        try {
            await checkInAPI();
            setCheckedIn(true);
            await loadCheckedInPlayers();
        } catch (err) {
            console.error("Failed to check in: ", err);
        }
    };

    const handleCheckOut = async () => {
        try {
            await checkOutAPI();
            setCheckedIn(false);
            await loadCheckedInPlayers();
        } catch (err) {
            console.error("Failed to check out: ", err);
        }
    }

    const loadCheckedInPlayers = async () => {
        try {
            const response = await getCheckedInPlayersAPI();
            setCheckedInPlayers(response.data.players);
        } catch (err) {
            console.error("Failed to load checked-in players:", err);
        }
    };

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
                                onClick={handleCheckIn}
                                disabled={checkedIn || statusLoading}
                            >
                                Check In
                            </Button>
                            <Button
                                size="large"
                                variant="outlined"
                                onClick={handleCheckOut}
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
                <Typography variant="h5">Number of people checked in: {checkedInPlayers.length} </Typography>
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