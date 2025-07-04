import React, { FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import {
    Table as MuiTable,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Card,
    CardContent,
    CardHeader,
    Container,
    Grid,
    Button,
} from "@mui/material";
import {
    CellContext,
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    RowData,
    Table,
    useReactTable,
} from "@tanstack/react-table";
import IconButton from "../common/IconButton";
import { FaBan, FaEdit, FaSave } from "react-icons/fa";
import ModifySeasonModal from "./ModifySeasonModal";
import {
    createSeasonMutation,
    saveSeasonMutation,
    updateSeasonMutation,
    useSeasons,
} from "../hooks/AdminHooks";

declare module "@tanstack/table-core" {
    interface TableMeta<TData extends RowData> {
        seasonsEditableRowId?: string | undefined;
        setSeasonsEditableRowId?: (id: string | undefined) => void;
        editedSeason?: TData | undefined;
        setEditedSeason?: (season: TData | undefined) => void;
        saveSeason?: () => Promise<void>;
    }
}

const EditableStringCell = (cellContext: CellContext<Season, any>) => {
    const { getValue, table, row, column } = cellContext;
    const initialValue = getValue() as string;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSeason: Season = {
            ...table.options.meta!.editedSeason!,
            [column.id]: e.target.value as string,
        };

        table.options.meta!.setEditedSeason!(newSeason);
    };

    if (row.id === table.options.meta?.seasonsEditableRowId) {
        return <TextField defaultValue={initialValue} onChange={onChange} />;
    }
    return <>{initialValue}</>;
};

const columnHelper = createColumnHelper<Season>();

const seasonColumns: ColumnDef<Season, any>[] = [
    columnHelper.accessor("name", {
        header: "Season Name",
        cell: EditableStringCell,
    }),
    columnHelper.accessor("startDate", {
        header: "Start Date",
        cell: (props) => new Date(props.getValue()).toDateString(),
    }),
    columnHelper.accessor("endDate", {
        header: "End Date",
        cell: (props) => new Date(props.getValue()).toDateString(),
    }),
    columnHelper.display({
        id: "actions",
        cell: (props) => <SeasonRowActions context={props} />,
    }),
];

const AdminSeason: FC = () => {
    const { player } = useContext(AuthContext);

    const [showCreateSeasonModal, setShowCreateSeasonModal] = useState<boolean>(false);
    const [showUpdateSeasonModal, setShowUpdateSeasonModal] = useState<boolean>(false);
    const [editableRowId, setEditableRowId] = useState<string | undefined>(undefined);
    const [editedSeason, setEditedSeason] = useState<Season | undefined>(undefined);
    if (!player) {
        return <>No player logged in</>;
    }
    const { isPending, error, data } = useSeasons();

    const getDefaultSeason = (): Season => {
        const startDate = new Date();

        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 2);

        return {
            id: "",
            name: "",
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString().substring(0, 10),
        };
    };

    const handleCreateSeasonModalShow = () => setShowCreateSeasonModal(true);
    const handleCreateSeasonModalClose = () => setShowCreateSeasonModal(false);
    const createSeasonMut = createSeasonMutation(player);
    const handleCreate = (season: Season) => {
        setShowCreateSeasonModal(false);
        const { id, ...createSeasonRequest } = season;
        createSeasonMut.mutate(createSeasonRequest);
    };

    const handleUpdateSeasonModalShow = () => setShowUpdateSeasonModal(true);
    const handleUpdateSeasonModalClose = () => setShowUpdateSeasonModal(false);
    const updateSeasonMut = updateSeasonMutation(player);
    const handleUpdate = (updatedSeason: Season) => {
        setShowUpdateSeasonModal(false);
        updateSeasonMut.mutate(updatedSeason);
    };

    const saveSeasonMut = saveSeasonMutation(player);
    const saveSeason = async () => {
        if (typeof editedSeason === "undefined") {
            console.log("Error updating season: editedSeason is undefined");
            return;
        }
        saveSeasonMut.mutate(editedSeason);
        setEditableRowId(undefined);
        setEditedSeason(undefined);
    };
    const seasons = data ?? [];

    const table: Table<Season> = useReactTable({
        data: seasons,
        columns: seasonColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
        meta: {
            seasonsEditableRowId: editableRowId,
            setSeasonsEditableRowId: setEditableRowId,
            editedSeason: editedSeason,
            setEditedSeason: setEditedSeason,
            saveSeason: saveSeason,
        },
    });
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
                <>
                    <CardContent>
                        <h3>{currentSeason.name}</h3>
                        <div>Start Date: {new Date(currentSeason.startDate).toDateString()}</div>
                        <div>End Date: {new Date(currentSeason.endDate).toDateString()}</div>
                        <Button variant="contained" onClick={handleUpdateSeasonModalShow}>
                            Edit
                        </Button>
                    </CardContent>
                    <ModifySeasonModal
                        show={showUpdateSeasonModal}
                        season={currentSeason}
                        handleClose={handleUpdateSeasonModalClose}
                        handleSubmit={handleUpdate}
                        actionString="Update Season"
                    />
                </>
            );
        }
        return (
            <>
                <CardContent>
                    <p>No current season</p>
                    <Button variant="contained" onClick={handleCreateSeasonModalShow}>
                        Create Season
                    </Button>
                </CardContent>
                <ModifySeasonModal
                    show={showCreateSeasonModal}
                    season={getDefaultSeason()}
                    handleClose={handleCreateSeasonModalClose}
                    handleSubmit={handleCreate}
                    actionString="Create Season"
                />
            </>
        );
    }

    return (
        <>
            <Container>
                <Grid container justifyContent="center">
                    <Grid size={6}>
                        <Card variant="outlined">
                            <CardHeader title="Current Season" />
                            {getCurrentSeasonPanel()}
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            <div>
                <h2>All Seasons</h2>
                <TableContainer>
                    <MuiTable>
                        <TableHead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableCell key={header.id}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHead>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </MuiTable>
                </TableContainer>
            </div>
        </>
    );
};

type SeasonRowActionsProps = {
    context: CellContext<Season, any>;
};
const SeasonRowActions: FC<SeasonRowActionsProps> = ({ context }) => {
    const meta = context.table.options.meta!;
    const rowIsEditable = context.row.id === meta.seasonsEditableRowId;
    const rowBeingEdited = typeof meta.seasonsEditableRowId !== "undefined";

    const editRow = () => {
        meta.setSeasonsEditableRowId!(context.row.id);
        meta.setEditedSeason!(context.row.original);
    };

    const exitRow = () => {
        meta.setSeasonsEditableRowId!(undefined);
        meta.setEditedSeason!(undefined);
    };

    const saveRow = () => {
        meta.saveSeason!();
    };

    return (
        <div>
            {rowIsEditable ? (
                <>
                    <IconButton onClick={() => exitRow()}>
                        <FaBan />
                    </IconButton>
                    <IconButton onClick={() => saveRow()}>
                        <FaSave />
                    </IconButton>
                </>
            ) : (
                <>
                    <IconButton disabled={rowBeingEdited} onClick={() => editRow()}>
                        <FaEdit />
                    </IconButton>
                </>
            )}
        </div>
    );
};

export default AdminSeason;
