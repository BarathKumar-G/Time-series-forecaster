


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from prophet import Prophet
import uvicorn
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware



# Add CORS middleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://192.168.29.78:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Define request model
class TimeSeriesRequest(BaseModel):
    timestamps: list[str]
    values: list[float]
    forecast_days: int

# Health check endpoint
@app.get("/status")
def health_check():
    return {"status": "API is running"}

# Forecasting endpoint
@app.post("/predict")
def predict_time_series(data: TimeSeriesRequest):
    try:
        print("🔹 Received Data:", data)  # ✅ Print input data

        # Convert input data to DataFrame
        df = pd.DataFrame({
            "ds": [datetime.strptime(ts, "%Y-%m-%d") for ts in data.timestamps],
            "y": data.values
        })
        print("📊 DataFrame Created:\n", df.head())  # ✅ Print DataFrame preview

        # Initialize and fit Prophet model
        model = Prophet()
        model.fit(df)
        print("✅ Prophet Model Trained")  # ✅ Confirm model training
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=data.forecast_days)
        print("📅 Future Dates Generated:\n", future.tail())  # ✅ Print future dates

        forecast = model.predict(future)
        print("📈 Forecast Generated:\n", forecast.tail())  # ✅ Print forecast preview

        # Extract relevant predictions
        predicted_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(data.forecast_days)
        historical_data = []
        for i in range(len(df)):
            historical_data.append({
                "ds": df["ds"][i].strftime("%Y-%m-%d"),
                "y": float(df["y"][i])
            })
        # Convert to dictionary response
        response = {"forecast": predicted_data.to_dict(orient="records"),"historical":historical_data}
        print("📤 Response Sent:", response)  # ✅ Print response

        return response
    except Exception as e:
        print("❌ Error in Prediction:", str(e))  # ✅ Print error
        raise HTTPException(status_code=500, detail=str(e))
'''def predict_time_series(data: TimeSeriesRequest):
    try:
        # Convert input data to DataFrame
        df = pd.DataFrame({
            "ds": [datetime.strptime(ts, "%Y-%m-%d") for ts in data.timestamps],
            "y": data.values
        })

        # Initialize and fit Prophet model
        model = Prophet()
        model.fit(df)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=data.forecast_days)
        forecast = model.predict(future)
        
        # Extract relevant predictions
        predicted_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(data.forecast_days)
        
        # Convert to dictionary response
        response = {
            "forecast": predicted_data.to_dict(orient="records")
        }
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
'''
# Run the API (if running locally)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
