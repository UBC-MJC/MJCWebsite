import {FC} from "react";

type AdminSeasonRowProps = {
    season: ISeason
}

const AdminSeasonRow: FC<AdminSeasonRowProps> = ({season}) => {
    return (
        <tr>
            <td>{season.name}</td>
            <td>{season.startDate}</td>
            <td>{season.endDate}</td>
        </tr>
    )
}

export default AdminSeasonRow