import { pageMeta } from "@/common/pageMeta";
import Leaderboard from "@/leaderboard/Leaderboard";

export const meta = () => pageMeta("Casual Hong Kong Leaderboard");

export default function LeaderboardHongKongCasual() {
    return <Leaderboard gameVariant="hk" gameType="CASUAL" />;
}
