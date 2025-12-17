import React, { useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function GridTable({ cols, rows, setRows }) {
  const gridRef = useRef(null);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      editable: true,
      floatingFilter: true,
      minWidth: 100,
    }),
    []
  );

  const onCellValueChanged = (params) => {
    const updated = rows.map((r, i) =>
      i === params.node.rowIndex ? params.data : r
    );
    setRows(updated);
  };

  return (
    <div 
      className="ag-theme-alpine rounded-xl overflow-hidden border border-gray-200" 
      style={{ height: "650px", width: "100%" }}
    >
      <AgGridReact
        ref={gridRef}
        columnDefs={cols}
        rowData={rows}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        rowSelection={{ mode: "multiple" }}
        animateRows={true}
      />
    </div>
  );
}