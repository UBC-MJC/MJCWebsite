import { pageMeta } from "@/common/pageMeta";
import Leaderboard from "@/leaderboard/Leaderboard";

export const meta = () => pageMeta("Japanese Leaderboard");

export default function LeaderboardJapanese() {
    return <Leaderboard gameVariant="jp" gameType="RANKED" />;
}
