import { pageMeta } from "@/common/pageMeta";
import Statistics from "@/statistics/Statistics";

export const meta = () => pageMeta("Japanese Statistics");

export default function JapaneseStatistics() {
    return <Statistics gameVariant="jp" />;
}
