"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ForecastData {
  ds: string; // Date as a string (e.g., "2023-01-01")
  yhat: number; // Forecasted value
  yhat_lower: number; // Lower bound of the forecast
  yhat_upper: number; // Upper bound of the forecast
}

interface DataTableProps {
  data: ForecastData[];
}

export default function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Date</TableHead>
            <TableHead className="text-left">Forecast</TableHead>
            <TableHead className="text-left">Lower Bound</TableHead>
            <TableHead className="text-left">Upper Bound</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.ds || "N/A"}</TableCell>
              <TableCell>{row.yhat?.toFixed(2) ?? "N/A"}</TableCell>
              <TableCell>{row.yhat_lower?.toFixed(2) ?? "N/A"}</TableCell>
              <TableCell>{row.yhat_upper?.toFixed(2) ?? "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
