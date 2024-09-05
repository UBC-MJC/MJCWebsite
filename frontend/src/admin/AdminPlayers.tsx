import React, { FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { AxiosError } from "axios";
import { makeDummyAdminsAPI, recalcSeasonAPI, removeQualificationAPI } from "../api/AdminAPI";
import { Form, Table as BTable } from "react-bootstrap";
import {
    CellContext,
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    RowData,
    useReactTable,
} from "@tanstack/react-table";
import { FaBan, FaCheck, FaEdit, FaSave, FaTrash } from "react-icons/fa";
import IconButton from "../common/IconButton";
import confirmDialog from "../common/ConfirmationDialog";
import { deletePlayerMutation, savePlayerMutation, useAdminPlayers } from "../hooks/AdminHooks";
import { Button } from "@mui/material";

const booleanToCheckmark = (value: boolean) => {
    return value ? (
        <div className="d-flex align-items-center justify-content-center">
            <FaCheck />
        </div>
    ) : (
        ""
    );
};

declare module "@tanstack/table-core" {
    interface TableMeta<TData extends RowData> {
        playersEditableRowId?: string | undefined;
        setPlayersEditableRowId?: (id: string | undefined) => void;
        editedPlayer?: TData | undefined;
        setEditedPlayer?: (player: TData | undefined) => void;
        savePlayer?: () => void;
        deletePlayer?: (playerId: string) => Promise<void>;
    }
}

const EditableBooleanCell = (cellContext: CellContext<Player, any>) => {
    const { getValue, table, row, column } = cellContext;
    const initialValue = getValue() as boolean;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPlayer: Player = {
            ...table.options.meta!.editedPlayer!,
            [column.id]: e.target.checked as boolean,
        };

        table.options.meta!.setEditedPlayer!(newPlayer);
    };

    if (row.id === table.options.meta?.playersEditableRowId) {
        return (
            <Form.Check className="text-center" defaultChecked={initialValue} onChange={onChange} />
        );
    }
    return booleanToCheckmark(initialValue);
};

const columnHelper = createColumnHelper<Player>();

const playerColumns: ColumnDef<Player, any>[] = [
    columnHelper.accessor("username", {
        header: "Username",
    }),
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: "fullName",
        header: "Name",
    }),
    columnHelper.accessor("email", {
        header: "Email",
    }),
    columnHelper.accessor("admin", {
        header: () => <div className="text-center">Admin</div>,
        cell: EditableBooleanCell,
    }),
    columnHelper.accessor("japaneseQualified", {
        header: () => <div className="text-center">JP Ranked</div>,
        cell: EditableBooleanCell,
    }),
    columnHelper.accessor("hongKongQualified", {
        header: () => <div className="text-center">HK Ranked</div>,
        cell: EditableBooleanCell,
    }),
    columnHelper.display({
        id: "actions",
        cell: (props) => <PlayerRowActions context={props} />,
    }),
];

const AdminPlayers: FC = () => {
    const { player } = useContext(AuthContext);

    if (!player) {
        return <>No player logged in</>;
    }
    const [editableRowId, setEditableRowId] = useState<string | undefined>(undefined);
    const [editedPlayer, setEditedPlayer] = useState<Player | undefined>(undefined);

    const { isPending, data, error } = useAdminPlayers(player);

    const deletePlayerMut = deletePlayerMutation(player);

    const savePlayerMut = savePlayerMutation(player);

    const makeTestAdmins = () => {
        makeDummyAdminsAPI(player.authToken).catch((err: AxiosError) => {
            console.log("Error making dummy admins: ", err.response?.data);
        });
    };

    const recalcCurrentSeasonHK = () => {
        recalcSeasonAPI(player.authToken, "hk")
            .then((response) => {
                console.log("HK Recalculation Complete", response.data);
            })
            .catch((err) => {
                console.log("Error recalculating hk", err.response.data);
            });
    };

    const recalcCurrentSeasonJP = () => {
        recalcSeasonAPI(player.authToken, "jp")
            .then((response) => {
                console.log("JP Recalculation Complete", response.data);
            })
            .catch((err) => {
                console.log("Error recalculating riichi", err.response.data);
            });
    };

    const deletePlayer = async (playerId: string) => {
        const response = await confirmDialog("Are you sure you want to delete this player?", {
            okText: "Delete",
            okButtonStyle: "danger",
        });
        if (response) {
            deletePlayerMut.mutate(playerId);
        }
    };

    const savePlayer = () => {
        if (editedPlayer) {
            savePlayerMut.mutate(editedPlayer);
            setEditableRowId(undefined);
            setEditedPlayer(undefined);
        } else {
            console.log("Error updating player: editedPlayer is undefined");
        }
    };
    const players = data ?? [];
    const table = useReactTable({
        data: players,
        columns: playerColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
        meta: {
            playersEditableRowId: editableRowId,
            setPlayersEditableRowId: setEditableRowId,
            editedPlayer,
            setEditedPlayer,
            savePlayer,
            deletePlayer,
        },
    });
    if (isPending) return <>Loading...</>;

    if (error) return <>{"An error has occurred: " + error.message}</>;
    return (
        <>
            <BTable
                striped
                borderless
                hover
                responsive
                className="my-4 text-start text-nowrap align-middle"
            >
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </BTable>
            <div className="my-4">
                <Button variant="outlined" onClick={makeTestAdmins}>
                    Make Test Admins
                </Button>
                <Button
                    color={"warning"}
                    onClick={() => {
                        removeQualificationAPI(player?.authToken);
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

type PlayerRowActionsProps = {
    context: CellContext<Player, any>;
};
const PlayerRowActions: FC<PlayerRowActionsProps> = ({ context }) => {
    const meta = context.table.options!.meta!;
    const rowIsEditable = context.row.id === meta.playersEditableRowId;
    const rowBeingEdited = typeof meta.playersEditableRowId !== "undefined";

    const editRow = () => {
        meta.setPlayersEditableRowId!(context.row.id);
        meta.setEditedPlayer!(context.row.original);
    };

    const exitRow = () => {
        meta.setPlayersEditableRowId!(undefined);
        meta.setEditedPlayer!(undefined);
    };

    const saveRow = () => {
        meta.savePlayer!();
    };

    const deleteRow = (rowId: string) => {
        meta.deletePlayer!(rowId);
    };

    return (
        <div className="d-flex flex-row-reverse">
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
                    <IconButton disabled={rowBeingEdited} onClick={() => deleteRow(context.row.id)}>
                        <FaTrash />
                    </IconButton>
                    <IconButton disabled={rowBeingEdited} onClick={() => editRow()}>
                        <FaEdit />
                    </IconButton>
                </>
            )}
        </div>
    );
};

export default AdminPlayers;
