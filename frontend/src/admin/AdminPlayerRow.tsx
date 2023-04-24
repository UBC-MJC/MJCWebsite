import {FC} from "react";

type AdminPlayerRowProps = {
    player: IPlayer
}

const AdminPlayerRow: FC<AdminPlayerRowProps> = ({player}) => {
    const booleanToCheckmark = (value: boolean) => {
        return value ? "✓" : ""
    }

    return (
        <tr>
            <td>{player.username}</td>
            <td>{player.firstName}</td>
            <td>{player.lastName}</td>
            <td>{player.email}</td>
            <td>{booleanToCheckmark(player.admin)}</td>
            <td>{booleanToCheckmark(player.japaneseQualified)}</td>
            <td>{booleanToCheckmark(player.hongKongQualified)}</td>
        </tr>
    )
}

export default AdminPlayerRow