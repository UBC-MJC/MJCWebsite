import React, {FC, useContext, useEffect, useState} from "react";
import {AuthContext} from "../common/AuthContext";
import {AxiosError} from "axios";
import {
    deletePlayerAPI,
    getPlayersAdminAPI,
    makeDummyAdminsAPI,
    recalcSeasonAPI,
    updatePlayerAPI,
} from "../api/AdminAPI";
import {Button, Form, Table as BTable} from "react-bootstrap";
import {
    CellContext,
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    RowData,
    useReactTable,
} from "@tanstack/react-table";
import {FaBan, FaCheck, FaEdit, FaSave, FaTrash} from "react-icons/fa";
import IconButton from "../common/IconButton";
import confirmDialog from "../common/ConfirmationDialog";

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
        savePlayer?: () => Promise<void>;
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

    return (
        <>
            {row.id === table.options.meta?.playersEditableRowId ? (
                <Form.Check
                    className="text-center"
                    defaultChecked={initialValue}
                    onChange={onChange}
                />
            ) : (
                booleanToCheckmark(initialValue)
            )}
        </>
    );
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

    const [players, setPlayers] = useState<Player[]>([]);
    const [editableRowId, setEditableRowId] = useState<string | undefined>(undefined);
    const [editedPlayer, setEditedPlayer] = useState<Player | undefined>(undefined);

    useEffect(() => {
        getPlayersAdminAPI(player!.authToken)
            .then((response) => {
                setPlayers(response.data.players);
            })
            .catch((error: AxiosError) => {
                console.log("Error fetching players: ", error.response?.data);
            });
    }, [player]);

    const deletePlayer = async (playerId: string) => {
        const response = await confirmDialog("Are you sure you want to delete this player?", {
            okText: "Delete",
            okButtonStyle: "danger",
        });
        if (!response) {
            return;
        }

        deletePlayerAPI(player!.authToken, playerId)
            .then((response) => {
                setPlayers(players.filter((player) => player.id !== response.data.id));
            })
            .catch((error: AxiosError) => {
                console.log("Error deleting player: ", error.response?.data);
            });
    };

    const savePlayer = async () => {
        if (typeof editedPlayer === "undefined") {
            console.log("Error updating player: editedPlayer is undefined");
            return;
        }

        updatePlayerAPI(player!.authToken, editedPlayer)
            .then((response) => {
                const newPlayers = players.map((player) => {
                    if (player.id === editedPlayer.id) {
                        return { ...editedPlayer };
                    }
                    return { ...player };
                });
                setPlayers(newPlayers);
                setEditableRowId(undefined);
                setEditedPlayer(undefined);
            })
            .catch((error: AxiosError) => {
                console.log("Error updating player: ", error.response?.data);
            });
    };

    const makeTestAdmins = () => {
        makeDummyAdminsAPI(player!.authToken).catch((err: any) => {
            console.log("Error making dummy admins: ", err.response?.data);
        });
    };

    const recalcCurrentSeasonHK = () => {
        recalcSeasonAPI(player!.authToken, "hk")
            .then((response) => {
                console.log("HK Recalculation Complete", response.data);
            })
            .catch((err: any) => {
                console.log("Error recalculating hk", err.response?.data);
            });
    };

    const recalcCurrentSeasonJP = () => {
        recalcSeasonAPI(player!.authToken, "jp")
            .then((response) => {
                console.log("JP Recalculation Complete", response.data);
            })
            .catch((err: any) => {
                console.log("Error recalculating riichi", err.response?.data);
            });
    };

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
                <Button variant="outline-dark" onClick={makeTestAdmins}>
                    Make Test Admins
                </Button>
                <Button variant="danger" onClick={recalcCurrentSeasonHK}>
                    Recalc Elo for HK games (Expensive operation!)
                </Button>
                <Button variant="danger" onClick={recalcCurrentSeasonJP}>
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
