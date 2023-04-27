import {FC} from "react";

type AdminSeasonRowProps = {
    season: Season
}

const AdminSeasonRow: FC<AdminSeasonRowProps> = ({season}) => {
    return (
        <tr>
            <td>{season.name}</td>
            <td>{new Date(season.startDate).toDateString()}</td>
            <td>{season.endDate ? new Date(season.endDate).toDateString() : ""}</td>
        </tr>
    )
}

export default AdminSeasonRow
