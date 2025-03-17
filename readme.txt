Time Series Forecaster

Project Overview

This project is a time series forecasting tool that allows users to upload or manually enter time series data and generate forecasts using Facebook Prophet. The application consists of a React frontend and a FastAPI backend.

Features

Upload time series data via CSV file.

Manually input time series data.

Specify the number of days for forecasting.

Visualize historical and forecasted data.

View forecasted data in a tabular format.

Project Structure

time-series-forecaster/
│── frontend/     # React frontend with Tailwind CSS
│── backend/      # FastAPI backend with Facebook Prophet
│── README.txt    # Project documentation


Prerequisites

	Python 3.8+ (for backend)

	Node.js 16+ (for frontend)

Backend Setup

	Navigate to the backend folder:

		cd backend

	Run the FastAPI server:

		uvicorn main:app --host 0.0.0.0 --port 8000

Frontend Setup

	Navigate to the frontend folder:

		cd frontend

	Install dependencies:

		npm install

	Start the development server:

		npm run dev

Usage

Open the frontend in a browser (default: http://localhost:3000).

Upload a CSV file or manually enter time series data.

Click Generate Forecast to fetch predictions from the backend.

View the forecasted data in graphical and tabular formats.

API Endpoints

POST /predict

Request Body:

{
  "timestamps": ["2024-03-01", "2024-03-02", "2024-03-03"],
  "values": [100, 105, 110],
  "forecast_days": 7
}

Response:

{
  "forecast": [{"timestamp": "2024-03-04", "value": 115}],
  "historical": [{"timestamp": "2024-03-01", "value": 100}]
}

Troubleshooting

If the forecast is not generating, check the browser console and backend logs for errors.

Ensure that FastAPI is running on http://localhost:8000 and accessible from the frontend.

License

This project is open-source and free to use.