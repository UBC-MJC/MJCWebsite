import {FC} from "react";
import {useParams} from "react-router-dom";
import WheelPicker, {PickerData} from 'react-simple-wheel-picker';

const data = [
    {
        id: '1',
        value: 'test1'
    },
    {
        id: '2',
        value: 'test2'
    },
    {
        id: '3',
        value: 'test3'
    },
    {
        id: '4',
        value: 'test4'
    },
    {
        id: '5',
        value: 'test5'
    }
];
const Game: FC = () => {
    const { id } = useParams()
    const handleOnChange = (target: PickerData) => {
        console.log(target);
    };

    return (
        <div>
            <h1>ID: {id}</h1>
            <WheelPicker
                data={data}
                onChange={handleOnChange}
                height={150}
                width={100}
                titleText="Enter value same as aria-label"
                itemHeight={30}
                selectedID={data[0].id}
                color="#ccc"
                activeColor="#333"
                backgroundColor="#fff"
            />
            <WheelPicker
                data={data}
                onChange={handleOnChange}
                height={150}
                width={100}
                titleText="Enter value same as aria-label"
                itemHeight={30}
                selectedID={data[0].id}
                color="#ccc"
                activeColor="#333"
                backgroundColor="#fff"
            />
        </div>
    )
}

export default Game
