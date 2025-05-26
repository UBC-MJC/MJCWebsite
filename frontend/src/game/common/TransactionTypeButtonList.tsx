type ListToggleButtonProps = {
    key: number;
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
};

// const ListToggleButton = (gameButtons: ListToggleButtonProps[], transactionType: string, transactionTypeOnChange: (any) => void) => {
//     return gameButtons.map((button, idx) => (
//         <Col key={idx} xs={4}>
//             <ToggleButton
//                 key={idx}
//                 
//                 value={button.value}
//                 id={button.name}
//                 selected={transactionType === button.value}
//                 onChange={(event, value) => transactionTypeOnChange(value)}
//             >
//                 {button.name}
//             </ToggleButton>
//         </Col>;
// };
//
// export default ListToggleButton;
