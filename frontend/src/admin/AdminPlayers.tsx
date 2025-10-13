import { useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { AxiosError } from "axios";
import { makeDummyAdminsAPI, recalcSeasonAPI, removeQualificationAPI } from "@/api/AdminAPI";
import { logger } from "@/common/logger";
import {
    useDeletePlayerMutation,
    useSavePlayerMutation,
    useAdminPlayers,
} from "@/hooks/AdminHooks";
import type { Player } from "@/types";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { Cancel, Delete, Edit, Save } from "@mui/icons-material";
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridRowModes,
    GridRowModesModel,
    GridRowParams,
} from "@mui/x-data-grid";

const AdminPlayers = () => {
    const { player } = useContext(AuthContext);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

    // Call all hooks unconditionally at the top
    const { isPending, data, error } = useAdminPlayers(player || undefined);
    const deletePlayerMut = useDeletePlayerMutation(player || undefined);
    const savePlayerMut = useSavePlayerMutation(player || undefined);

    // Early return after all hooks
    if (!player) {
        return <>No player logged in</>;
    }

    const playerColumns: GridColDef<Player>[] = [
        {
            field: "username",
            headerName: "Username",
            flex: 1,
            editable: true,
        },
        {
            field: "fullName",
            headerName: "Full Name",
            flex: 1.5,
            valueGetter: (_, row) => `${row.firstName || ""} ${row.lastName || ""}`,
        },
        {
            field: "email",
            headerName: "Email",
            flex: 1,
        },
        {
            field: "admin",
            headerName: "Admin",
            flex: 0.5,
            type: "boolean",
            editable: true,
        },
        {
            field: "japaneseQualified",
            headerName: "JP Qualified",
            flex: 0.5,
            type: "boolean",
            editable: true,
        },
        {
            field: "hongKongQualified",
            headerName: "HK Qualified",
            flex: 0.5,
            type: "boolean",
            editable: true,
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: ({ id, row }: GridRowParams<Player>) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            key="save"
                            icon={<Save />}
                            onClick={() =>
                                setRowModesModel({
                                    ...rowModesModel,
                                    [id]: { mode: GridRowModes.View },
                                })
                            }
                            label="Save"
                        />,
                        <GridActionsCellItem
                            key="cancel"
                            icon={<Cancel />}
                            onClick={() =>
                                setRowModesModel({
                                    ...rowModesModel,
                                    [id]: { mode: GridRowModes.View, ignoreModifications: true },
                                })
                            }
                            label="Cancel"
                        />,
                    ];
                }
                return [
                    <GridActionsCellItem
                        key="edit"
                        icon={<Edit />}
                        onClick={() =>
                            setRowModesModel({
                                ...rowModesModel,
                                [id]: { mode: GridRowModes.Edit },
                            })
                        }
                        label="Edit"
                    />,
                    <DeleteUserActionItem
                        key="delete"
                        label="Delete"
                        deleteUser={() => deletePlayerMut.mutate(row.id)}
                    />,
                ];
            },
        },
    ];

    const makeTestAdmins = async () => {
        try {
            await makeDummyAdminsAPI();
        } catch (err) {
            logger.log("Error making dummy admins: ", (err as AxiosError).response?.data);
        }
    };

    const recalcCurrentSeasonHK = async () => {
        try {
            const response = await recalcSeasonAPI("hk");
            logger.log("HK Recalculation Complete", response.data);
        } catch (err: any) {
            logger.log("Error recalculating hk", err.response.data);
        }
    };

    const recalcCurrentSeasonJP = async () => {
        try {
            const response = await recalcSeasonAPI("jp");
            logger.log("JP Recalculation Complete", response.data);
        } catch (err) {
            logger.log("Error recalculating riichi", (err as AxiosError).response?.data);
        }
    };

    const savePlayer = (editedPlayer: Player) => {
        if (editedPlayer) {
            savePlayerMut.mutate(editedPlayer);
        } else {
            logger.log("Error updating player: editedPlayer is undefined");
        }
    };
    if (isPending || !data) return <>Loading...</>;

    if (error) return <>{"An error has occurred: " + error.message}</>;
    return (
        <>
            <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid
                    rows={data}
                    columns={playerColumns}
                    rowModesModel={rowModesModel}
                    autosizeOnMount
                    onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
                    processRowUpdate={(updatedRow, originalRow) => {
                        if (updatedRow === originalRow) {
                            return updatedRow;
                        }
                        savePlayer(updatedRow);
                        return updatedRow;
                    }}
                    editMode="row"
                />
            </Box>
            <div className="my-4">
                <Button variant="outlined" onClick={makeTestAdmins}>
                    Make Test Admins
                </Button>
                <Button
                    color={"warning"}
                    onClick={() => {
                        removeQualificationAPI();
                    }}
                >
                    Remove all qualification
                </Button>
                <Button variant="outlined" color="warning" onClick={recalcCurrentSeasonHK}>
                    Recalc Elo for HK games (Expensive operation!)
                </Button>
                <Button variant="outlined" color="warning" onClick={recalcCurrentSeasonJP}>
                    Recalc Elo for JP games (Expensive operation!)
                </Button>
            </div>
        </>
    );
};

function DeleteUserActionItem({ deleteUser, label }: { label: string; deleteUser: () => void }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <GridActionsCellItem label={label} icon={<Delete />} onClick={() => setOpen(true)} />
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Delete this user?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            setOpen(false);
                            deleteUser();
                        }}
                        color="warning"
                        autoFocus
                        title="Delete"
                    />
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminPlayers;
