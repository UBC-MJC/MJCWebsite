import type { Route } from "./+types/game";
import { pageMeta } from "@/common/pageMeta";
import Game from "@/game/Game";

export function meta({ params }: Route.MetaArgs) {
    return pageMeta(`Game ${params.id}`);
}

export default function GameRoute() {
    return <Game />;
}
