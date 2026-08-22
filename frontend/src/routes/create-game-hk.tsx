import { pageMeta } from "@/common/pageMeta";
import CreateGame from "@/game/CreateGame";

export const meta = () => pageMeta("Create Hong Kong Game");

export default function CreateHongKongGame() {
    return <CreateGame gameVariant="hk" gameType="RANKED" />;
}
