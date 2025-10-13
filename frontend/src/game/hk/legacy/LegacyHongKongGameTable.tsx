import { mapWindToCharacter } from "@/common/Utils";
import { GridColDef } from "@mui/x-data-grid";
import TableDisplay from "@/game/common/TableDisplay";
import type { HongKongRound, GamePlayer } from "@/types";
interface LegacyGameTableProps {
    rounds: ModifiedHongKongRound[];
    players: GamePlayer[];
}

export type ModifiedHongKongRound = HongKongRound & { scoreDeltas: number[] };

const LegacyHongKongGameTable = ({ rounds, players }: LegacyGameTableProps) => {
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
        },
        {
            field: "southScore",
            headerName: players[1].username,
            flex: 1,
            valueGetter: (_, row) => row.scoreDeltas[1],
            type: "number",
        },
        {
            field: "westScore",
            headerName: players[2].username,
            flex: 1,
            valueGetter: (_, row) => row.scoreDeltas[2],
            type: "number",
        },
        {
            field: "northScore",
            headerName: players[3].username,
            flex: 1,
            valueGetter: (_, row) => row.scoreDeltas[3],
            type: "number",
        },
    ];

    return <TableDisplay<ModifiedHongKongRound> rounds={rounds} columns={columns} />;
};

export default LegacyHongKongGameTable;
