"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ManualDataEntryProps {
  onDataSubmit: (data: { timestamps: string[]; values: number[] }) => void
}

export default function ManualDataEntry({ onDataSubmit }: ManualDataEntryProps) {
  const [dataPoints, setDataPoints] = useState<{ date: string; value: string }[]>([
    { date: "", value: "" },
    { date: "", value: "" },
  ])
  const [error, setError] = useState<string | null>(null)

  const handleAddRow = () => {
    setDataPoints([...dataPoints, { date: "", value: "" }])
  }

  const handleRemoveRow = (index: number) => {
    if (dataPoints.length <= 2) {
      setError("At least 2 data points are required.")
      return
    }

    setDataPoints((prev) => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (index: number, field: "date" | "value", value: string) => {
    setDataPoints((prev) =>
      prev.map((point, i) => (i === index ? { ...point, [field]: value.trim() } : point))
    )
    setError(null)
  }

  const handleSubmit = () => {
    try {
      if (dataPoints.length < 2) {
        throw new Error("At least 2 data points are required.")
      }

      const timestamps: string[] = []
      const values: number[] = []

      dataPoints.forEach(({ date, value }, i) => {
        if (!date || !value.trim()) {
          throw new Error(`Row ${i + 1} has empty fields.`)
        }

        // Validate date
        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) {
          throw new Error(`Invalid date at row ${i + 1}: "${date}".`)
        }

        // Validate value
        const numValue = Number.parseFloat(value)
        if (isNaN(numValue)) {
          throw new Error(`Invalid value at row ${i + 1}: "${value}". Please enter a valid number.`)
        }

        timestamps.push(dateObj.toISOString().split("T")[0])
        values.push(numValue)
      })

      // Sort data by date
      const sortedData = timestamps
        .map((date, i) => ({ date, value: values[i] }))
        .sort((a, b) => a.date.localeCompare(b.date))

      onDataSubmit({
        timestamps: sortedData.map((d) => d.date),
        values: sortedData.map((d) => d.value),
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataPoints.map((point, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="date"
                    value={point.date}
                    onChange={(e) => handleInputChange(index, "date", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={point.value}
                    onChange={(e) => handleInputChange(index, "value", e.target.value)}
                    placeholder="Value"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleAddRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
        <Button onClick={handleSubmit}>Submit Data</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
