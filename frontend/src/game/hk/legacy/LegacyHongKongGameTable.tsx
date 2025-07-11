import { FC } from "react";
import { mapWindToCharacter } from "../../../common/Utils";
import { GridColDef } from "@mui/x-data-grid";
import TableDisplay from "../../common/TableDisplay";
interface LegacyGameTableProps {
    rounds: ModifiedHongKongRound[];
    players: GamePlayer[];
}

export type ModifiedHongKongRound = HongKongRound & { scoreDeltas: number[] };

const LegacyHongKongGameTable: FC<LegacyGameTableProps> = ({ rounds, players }) => {
    const columns: GridColDef<ModifiedHongKongRound>[] = [
        {
            field: "round",
            headerName: "Round",
            flex: 1.5,
            valueGetter: (_, row) => `${mapWindToCharacter(row.roundWind)} ${row.roundNumber}`,
        },
        {
            field: "eastScore",
            headerName: players[0].username,
            flex: 1,
            valueGetter: (_, row) => row.scoreDeltas[0],
            type: "number",
            sortable: false,
        },
        {
            field: "southScore",
            headerName: players[1].username,
            flex: 1,
            valueGetter: (_, row) => row.scoreDeltas[1],
            type: "number",
            sortable: false,
        },
        {
            field: "westScore",
            headerName: players[2].username,
            flex: 1,
            valueGetter: (_, row) => row.scoreDeltas[2],
            type: "number",
            sortable: false,
        },
        {
            field: "northScore",
            headerName: players[3].username,
            flex: 1,
            valueGetter: (_, row) => row.scoreDeltas[3],
            type: "number",
            sortable: false,
        },
    ];

    return <TableDisplay<ModifiedHongKongRound> rounds={rounds} columns={columns} />;
};

export default LegacyHongKongGameTable;
