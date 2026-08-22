import { pageMeta } from "@/common/pageMeta";
import CreateGame from "@/game/CreateGame";

export const meta = () => pageMeta("Create Japanese Game");

export default function CreateJapaneseGame() {
    return <CreateGame gameVariant="jp" gameType="RANKED" />;
}
