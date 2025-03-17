"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload, FileText, TrendingUp, Calendar, RefreshCw } from "lucide-react"
import TimeSeriesChart from "@/components/time-series-chart"
import DataTable from "@/components/data-table"
import CSVUploader from "@/components/csv-uploader"
import ManualDataEntry from "@/components/manual-data-entry"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(7)
  const [timeSeriesData, setTimeSeriesData] = useState<{ timestamps: string[]; values: number[] } | null>(null)
  const [forecastData, setForecastData] = useState<any[] | null>(null)
  const [historicalData, setHistoricalData] = useState<any[] | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleForecastDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setForecastDays(value)
    }
  }

  const handleDataSubmit = async (data: { timestamps: string[]; values: number[] }) => {
    console.log("Received data:", data)
    setTimeSeriesData(data)
    await generateForecast(data)
  }

  const generateForecast = async (data: { timestamps: string[]; values: number[] }) => {
    if (!data || data.timestamps.length === 0 || data.values.length === 0) {
      setError("Please provide time series data first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamps: data.timestamps,
          values: data.values,
          forecast_days: forecastDays,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to generate forecast")
      }

      const result = await response.json()
      setForecastData(result.forecast)
      setHistoricalData(result.historical)
      console.log("Updated Forecast Data:", result.forecast)
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the forecast")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto py-12 px-6 max-w-5xl">
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-5xl font-bold text-center text-gray-900 dark:text-white mb-3">
            <TrendingUp className="inline-block mr-3 h-10 w-10 text-blue-600 dark:text-blue-400" />
            Time Series Forecasting
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl text-center">
            Upload your data, configure forecast parameters, and get accurate time series predictions with confidence intervals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="shadow-xl rounded-xl border-t-4 border-blue-500 dark:border-blue-600 overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800">
              <CardTitle className="text-2xl font-bold flex items-center text-gray-800 dark:text-gray-200">
                <Calendar className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                Input Data
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                Upload a CSV file or manually enter time series data to generate a forecast.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex w-full mb-6 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  <TabsTrigger 
                    value="upload" 
                    className="flex-1 flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md text-lg transition-all"
                  >
                    <Upload className="h-5 w-5" />
                    Upload CSV
                  </TabsTrigger>
                  <TabsTrigger 
                    value="manual" 
                    className="flex-1 flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md text-lg transition-all"
                  >
                    <FileText className="h-5 w-5" />
                    Manual Entry
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-inner">
                  <CSVUploader onDataLoaded={handleDataSubmit} />
                </TabsContent>

                <TabsContent value="manual" className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-inner">
                  <ManualDataEntry onDataSubmit={handleDataSubmit} />
                </TabsContent>
              </Tabs>

              <Separator className="my-8" />

              <div className="mb-6 bg-blue-50 dark:bg-gray-800 p-6 rounded-xl">
                <Label htmlFor="forecast-days" className="text-xl font-semibold mb-3 block text-gray-800 dark:text-gray-200">
                  Forecast Horizon
                </Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Input
                      id="forecast-days"
                      type="number"
                      min="1"
                      value={forecastDays}
                      onChange={handleForecastDaysChange}
                      className="pl-4 pr-10 py-3 text-lg w-32 border-2 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">days</span>
                  </div>
                  <Button
                    onClick={() => timeSeriesData && generateForecast(timeSeriesData)}
                    disabled={loading || !timeSeriesData}
                    className="px-8 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5" />
                        Generate Forecast
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4 border-2 border-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="text-lg font-bold">Error</AlertTitle>
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {forecastData && historicalData && (
            <>
              <Card className="shadow-xl rounded-xl border-t-4 border-green-500 dark:border-green-600 overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800">
                  <CardTitle className="text-2xl font-bold flex items-center text-gray-800 dark:text-gray-200">
                    <TrendingUp className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                    Forecast Visualization
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                    Time series data with forecast and confidence intervals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-96">
                  <TimeSeriesChart historicalData={historicalData} forecastData={forecastData} />
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800 py-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Historical data points are shown in blue, forecast in green, with confidence intervals in light green.
                  </p>
                </CardFooter>
              </Card>

              <Card className="shadow-xl rounded-xl border-t-4 border-purple-500 dark:border-purple-600 overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800">
                  <CardTitle className="text-2xl font-bold flex items-center text-gray-800 dark:text-gray-200">
                    <FileText className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                    Forecast Data
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                    Detailed forecast values for the next {forecastDays} days with upper and lower bounds.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <DataTable data={forecastData} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}