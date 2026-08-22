import { pageMeta } from "@/common/pageMeta";
import { LiveGames } from "@/game/LiveGames";

export const meta = () => pageMeta("Live Japanese Games");

export default function LiveJapaneseGames() {
    return <LiveGames gameVariant="jp" gameType="RANKED" />;
}
