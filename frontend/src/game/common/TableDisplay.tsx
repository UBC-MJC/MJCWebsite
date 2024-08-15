import { flexRender, Table } from "@tanstack/react-table";
import React from "react";
import { Table as BTable } from "react-bootstrap";

function displayTable(table: Table<any>, currentScoreRow: (string | number)[]) {
    return (
        <BTable striped borderless responsive className="my-4 text-nowrap align-middle">
            <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}

                <tr className="footer-row" key="current-score">
                    {currentScoreRow.map((value, idx) => (
                        <td className={idx === 0 ? "footer-label" : ""} key={idx}>
                            {value}
                        </td>
                    ))}
                </tr>
            </tbody>
        </BTable>
    );
}

export default displayTable;
