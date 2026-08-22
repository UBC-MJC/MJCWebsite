import { pageMeta } from "@/common/pageMeta";
import CreateGame from "@/game/CreateGame";

export const meta = () => pageMeta("Create Casual Hong Kong Game");

export default function CreateCasualHongKongGame() {
    return <CreateGame gameVariant="hk" gameType="CASUAL" />;
}
