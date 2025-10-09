import { DataGrid, GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { memo } from "react";

function TableDisplay<T extends GridValidRowModel>(props: {
    rounds: T[];
    columns: GridColDef<T>[];
}) {
    const { rounds, columns } = props;
    return (
        <DataGrid<T>
            rows={rounds}
            columns={columns}
            getRowId={(round) => round.roundCount}
            disableColumnMenu
            disableColumnSorting
            disableColumnResize
            hideFooter
            sx={{ width: "100%" }}
        />
    );
}
// function TableDisplay(props: { table: Table<any>; currentScoreRow: (string | number)[] }) {
//     const { table, currentScoreRow } = props;
//     return (
//         <Box width="100%">
//             <BTable striped borderless responsive className="my-4 text-nowrap align-middle">
//                 <thead>
//                     {table.getHeaderGroups().map((headerGroup) => (
//                         <tr key={headerGroup.id} style={{ maxWidth: "100%" }}>
//                             {headerGroup.headers.map((header) => (
//                                 <th key={header.id} style={{ maxWidth: "20%" }}>
//                                     {flexRender(
//                                         header.column.columnDef.header,
//                                         header.getContext(),
//                                     )}
//                                 </th>
//                             ))}
//                         </tr>
//                     ))}
//                 </thead>
//                 <tbody>
//                     {table.getRowModel().rows.map((row) => (
//                         <tr key={row.id}>
//                             {row.getVisibleCells().map((cell) => (
//                                 <td key={cell.id}>
//                                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}

//                     <tr className="footer-row" key="current-score">
//                         {currentScoreRow.map((value, idx) => (
//                             <td className={idx === 0 ? "footer-label" : ""} key={idx}>
//                                 {value}
//                             </td>
//                         ))}
//                     </tr>
//                 </tbody>
//             </BTable>
//         </Box>
//     );
// }

export default memo(TableDisplay) as typeof TableDisplay;
