"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";

interface CSVUploaderProps {
  onDataLoaded: (data: { timestamps: string[]; values: number[] }) => void;
}

export default function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are supported");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const rows = text.split(/\r\n|\n|\r/).filter((row) => row.trim() !== ""); // Platform-independent

      if (rows.length < 2) {
        throw new Error("CSV file must contain at least two rows (header + data)");
      }

      let startRow = 0;
      const firstRow = rows[0].split(",");
      if (isNaN(Number.parseFloat(firstRow[1]))) {
        startRow = 1; // Skip header row
      }

      const timestamps: string[] = [];
      const values: number[] = [];

      for (let i = startRow; i < rows.length; i++) {
        const columns = rows[i].split(",");

        if (columns.length < 2) {
          throw new Error(`Invalid format at row ${i + 1}: Expected at least 2 columns`);
        }

        const timestamp = columns[0].trim();
        const value = Number.parseFloat(columns[1].trim());

        if (isNaN(value)) {
          throw new Error(`Invalid numeric value at row ${i + 1}: "${columns[1]}"`);
        }

        // Validate date
        if (isNaN(Date.parse(timestamp))) {
          throw new Error(`Invalid date format at row ${i + 1}: "${timestamp}"`);
        }

        timestamps.push(timestamp);
        values.push(value);
      }

      if (timestamps.length === 0) {
        throw new Error("No valid data found in the CSV file");
      }

      onDataLoaded({ timestamps, values });
    } catch (err: any) {
      setError(err.message || "Failed to parse CSV file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input type="file" accept=".csv" onChange={handleFileChange} className="flex-1" />
        <Button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Processing..." : "Upload"}
          <Upload className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Upload a CSV file with the following format:</p>
        <pre className="mt-2 p-2 bg-muted rounded-md">
          date,value
          <br />
          2023-01-01,100
          <br />
          2023-01-02,105
          <br />
          ...
        </pre>
      </div>
    </div>
  );
}
