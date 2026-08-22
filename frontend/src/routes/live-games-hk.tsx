import { pageMeta } from "@/common/pageMeta";
import { LiveGames } from "@/game/LiveGames";

export const meta = () => pageMeta("Live Hong Kong Games");

export default function LiveHongKongGames() {
    return <LiveGames gameVariant="hk" gameType="RANKED" />;
}
