import { pageMeta } from "@/common/pageMeta";
import Leaderboard from "@/leaderboard/Leaderboard";

export const meta = () => pageMeta("Hong Kong Leaderboard");

export default function LeaderboardHongKong() {
    return <Leaderboard gameVariant="hk" gameType="RANKED" />;
}
