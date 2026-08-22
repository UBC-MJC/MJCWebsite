import { pageMeta } from "@/common/pageMeta";
import Leaderboard from "@/leaderboard/Leaderboard";

export const meta = () => pageMeta("Casual Japanese Leaderboard");

export default function LeaderboardJapaneseCasual() {
    return <Leaderboard gameVariant="jp" gameType="CASUAL" />;
}
