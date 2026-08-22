import { pageMeta } from "@/common/pageMeta";
import CreateGame from "@/game/CreateGame";

export const meta = () => pageMeta("Create Casual Japanese Game");

export default function CreateCasualJapaneseGame() {
    return <CreateGame gameVariant="jp" gameType="CASUAL" />;
}
