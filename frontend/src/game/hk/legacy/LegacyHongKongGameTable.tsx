import { mapWindToCharacter } from "@/common/Utils";
import TableDisplay, { RoundRow } from "@/game/common/TableDisplay";
import type { HongKongRound, GamePlayer } from "@/types";
interface LegacyGameTableProps {
    rounds: ModifiedHongKongRound[];
    players: GamePlayer[];
    dealerIndex?: number;
}

export type ModifiedHongKongRound = HongKongRound & { scoreDeltas: number[] };

const LegacyHongKongGameTable = ({ rounds, players, dealerIndex }: LegacyGameTableProps) => {
    const rows: RoundRow[] = rounds.map((round) => ({
        id: round.roundCount,
        label: `${mapWindToCharacter(round.roundWind)} ${round.roundNumber}`,
        deltas: round.scoreDeltas,
    }));

    return <TableDisplay rows={rows} players={players} dealerIndex={dealerIndex} />;
};

export default LegacyHongKongGameTable;
