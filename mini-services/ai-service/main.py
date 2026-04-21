"""
ERP Pro - AI/ML Microservice
============================
FastAPI service providing AI/ML capabilities for the ERP system:
- Demand Forecasting (Moving Average, Exponential Smoothing)
- Inventory Optimization (Reorder Point, Safety Stock calculation)
- Sales Trend Analysis
- Anomaly Detection
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import math

app = FastAPI(
    title="ERP Pro AI Service",
    description="AI/ML microservice for demand forecasting and inventory optimization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODELS
# ============================================

class SalesDataPoint(BaseModel):
    date: str
    quantity: int
    revenue: float

class ForecastRequest(BaseModel):
    product_name: str
    historical_data: List[SalesDataPoint]
    forecast_periods: int = 3
    method: str = "auto"  # auto, moving_avg, exponential, linear

class InventoryItem(BaseModel):
    product_name: str
    current_stock: int
    avg_daily_demand: float
    lead_time_days: int
    demand_std_dev: float = 0.0
    service_level: float = 0.95  # 95% service level

class OptimizationRequest(BaseModel):
    items: List[InventoryItem]

class AnomalyRequest(BaseModel):
    product_name: str
    data: List[SalesDataPoint]
    threshold: float = 2.0  # Standard deviations

# ============================================
# DEMAND FORECASTING
# ============================================

def moving_average_forecast(data: List[float], periods: int, window: int = 3) -> List[float]:
    """Simple Moving Average Forecast"""
    if len(data) < window:
        window = len(data)
    last_avg = np.mean(data[-window:])
    return [last_avg * (1 + 0.02 * i) for i in range(periods)]  # slight trend

def exponential_smoothing_forecast(data: List[float], periods: int, alpha: float = 0.3) -> List[float]:
    """Exponential Smoothing Forecast"""
    if not data:
        return [0.0] * periods
    
    # Simple exponential smoothing
    s = [data[0]]
    for val in data[1:]:
        s.append(alpha * val + (1 - alpha) * s[-1])
    
    last_smoothed = s[-1]
    # Trend component
    if len(data) >= 2:
        trend = (s[-1] - s[-2])
    else:
        trend = 0
    
    forecasts = []
    for i in range(periods):
        forecasts.append(max(0, last_smoothed + trend * (i + 1)))
    return forecasts

def linear_regression_forecast(data: List[float], periods: int) -> List[float]:
    """Linear Regression Forecast"""
    if len(data) < 2:
        return [data[0] if data else 0] * periods
    
    x = np.arange(len(data))
    y = np.array(data)
    
    # Fit linear regression
    coeffs = np.polyfit(x, y, 1)
    slope, intercept = coeffs
    
    future_x = np.arange(len(data), len(data) + periods)
    forecasts = slope * future_x + intercept
    return [max(0, f) for f in forecasts]

@app.post("/api/forecast")
async def generate_forecast(request: ForecastRequest):
    """Generate demand forecast for a product"""
    if not request.historical_data:
        raise HTTPException(status_code=400, detail="No historical data provided")
    
    quantities = [d.quantity for d in request.historical_data]
    revenues = [d.revenue for d in request.historical_data]
    
    # Determine best method
    if request.method == "auto":
        if len(quantities) >= 6:
            method = "linear"
        elif len(quantities) >= 3:
            method = "exponential"
        else:
            method = "moving_avg"
    else:
        method = request.method
    
    # Generate forecasts
    if method == "moving_avg":
        qty_forecasts = moving_average_forecast(quantities, request.forecast_periods)
        rev_forecasts = moving_average_forecast(revenues, request.forecast_periods)
    elif method == "exponential":
        qty_forecasts = exponential_smoothing_forecast(quantities, request.forecast_periods)
        rev_forecasts = exponential_smoothing_forecast(revenues, request.forecast_periods)
    elif method == "linear":
        qty_forecasts = linear_regression_forecast(quantities, request.forecast_periods)
        rev_forecasts = linear_regression_forecast(revenues, request.forecast_periods)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown method: {method}")
    
    # Calculate confidence based on data quality
    data_quality = min(1.0, len(quantities) / 12)
    variance = np.std(quantities) / (np.mean(quantities) + 1)
    confidence = max(0.3, min(0.95, data_quality * (1 - variance * 0.1)))
    
    # Generate period labels
    periods = []
    now = datetime.now()
    for i in range(request.forecast_periods):
        future_date = now + timedelta(days=30 * (i + 1))
        periods.append(future_date.strftime("%Y-%m"))
    
    return {
        "product_name": request.product_name,
        "method": method,
        "forecasts": [
            {
                "period": periods[i],
                "predicted_demand": int(round(qty_forecasts[i])),
                "predicted_revenue": round(rev_forecasts[i], 2),
                "confidence": round(confidence * (0.95 ** i), 3),  # confidence decreases over time
                "lower_bound": int(round(qty_forecasts[i] * (1 - variance * 0.5))),
                "upper_bound": int(round(qty_forecasts[i] * (1 + variance * 0.5)))
            }
            for i in range(request.forecast_periods)
        ],
        "model_info": {
            "method": method,
            "data_points": len(quantities),
            "avg_demand": round(np.mean(quantities), 2),
            "demand_trend": "increasing" if len(quantities) >= 2 and quantities[-1] > quantities[0] else "decreasing" if len(quantities) >= 2 else "stable",
            "seasonality_detected": len(quantities) >= 12  # simplified check
        }
    }

# ============================================
# INVENTORY OPTIMIZATION
# ============================================

@app.post("/api/optimize")
async def optimize_inventory(request: OptimizationRequest):
    """Calculate optimal reorder points and quantities"""
    results = []
    
    for item in request.items:
        # Safety stock calculation using service level
        # Z-score for service level (95% -> 1.645, 99% -> 2.326)
        z_scores = {0.90: 1.28, 0.95: 1.645, 0.97: 1.88, 0.99: 2.326}
        z = z_scores.get(item.service_level, 1.645)
        
        # Safety Stock = Z * σ_demand * √lead_time
        if item.demand_std_dev > 0:
            safety_stock = z * item.demand_std_dev * math.sqrt(item.lead_time_days)
        else:
            # Estimate std dev as 30% of mean if not provided
            safety_stock = z * item.avg_daily_demand * 0.3 * math.sqrt(item.lead_time_days)
        
        safety_stock = math.ceil(safety_stock)
        
        # Reorder Point = (Avg Daily Demand × Lead Time) + Safety Stock
        reorder_point = math.ceil(item.avg_daily_demand * item.lead_time_days + safety_stock)
        
        # Economic Order Quantity (simplified)
        # EOQ = √(2DS/H) where D=annual demand, S=order cost, H=holding cost
        annual_demand = item.avg_daily_demand * 365
        order_cost = 500  # ₹ per order (estimated)
        holding_cost_pct = 0.25  # 25% of item value
        avg_item_value = 1000  # estimated
        
        eoq = math.sqrt(2 * annual_demand * order_cost / (holding_cost_pct * avg_item_value))
        eoq = max(math.ceil(eoq), reorder_point - item.current_stock)  # at least cover gap
        
        # Suggested order quantity
        if item.current_stock <= reorder_point:
            suggested_order = max(eoq, reorder_point * 2 - item.current_stock)
        else:
            suggested_order = 0
        
        # Status determination
        stock_coverage_days = item.current_stock / max(item.avg_daily_demand, 1)
        if item.current_stock <= 0:
            status = "out_of_stock"
        elif item.current_stock <= safety_stock:
            status = "critical"
        elif item.current_stock <= reorder_point:
            status = "reorder_now"
        elif stock_coverage_days < 30:
            status = "low"
        else:
            status = "optimal"
        
        results.append({
            "product_name": item.product_name,
            "current_stock": item.current_stock,
            "safety_stock": safety_stock,
            "reorder_point": reorder_point,
            "eoq": math.ceil(eoq),
            "suggested_order_qty": math.ceil(suggested_order),
            "stock_coverage_days": round(stock_coverage_days, 1),
            "status": status,
            "annual_demand_estimate": math.ceil(annual_demand),
            "recommendations": _generate_recommendations(status, stock_coverage_days, item.current_stock, reorder_point)
        })
    
    return {"optimizations": results, "total_items": len(results), "critical_items": sum(1 for r in results if r["status"] in ["out_of_stock", "critical"])}

def _generate_recommendations(status: str, coverage: float, current: int, reorder: int) -> List[str]:
    """Generate actionable recommendations"""
    recs = []
    if status == "out_of_stock":
        recs.append("URGENT: Product is out of stock. Place emergency order immediately.")
        recs.append("Consider sourcing from alternative suppliers.")
    elif status == "critical":
        recs.append("Stock is at critical level. Reorder immediately to avoid stockout.")
        recs.append("Review safety stock levels - current levels may be too low.")
    elif status == "reorder_now":
        recs.append(f"Stock has fallen below reorder point ({current} < {reorder}). Place order now.")
    elif status == "low":
        recs.append(f"Stock coverage is {coverage:.0f} days. Plan reorder within next 2 weeks.")
    else:
        recs.append("Stock levels are optimal. Continue monitoring.")
    return recs

# ============================================
# ANOMALY DETECTION
# ============================================

@app.post("/api/anomaly-detect")
async def detect_anomalies(request: AnomalyRequest):
    """Detect anomalies in sales data using Z-score method"""
    if len(request.data) < 3:
        return {"anomalies": [], "message": "Insufficient data for anomaly detection (need at least 3 data points)"}
    
    quantities = [d.quantity for d in request.data]
    mean = np.mean(quantities)
    std = np.std(quantities)
    
    if std == 0:
        return {"anomalies": [], "message": "No variation in data - no anomalies detected"}
    
    anomalies = []
    for i, point in enumerate(request.data):
        z_score = (point.quantity - mean) / std
        if abs(z_score) > request.threshold:
            anomaly_type = "spike" if z_score > 0 else "drop"
            severity = "high" if abs(z_score) > 3 else "medium" if abs(z_score) > 2.5 else "low"
            anomalies.append({
                "date": point.date,
                "quantity": point.quantity,
                "expected_range": [round(mean - request.threshold * std), round(mean + request.threshold * std)],
                "z_score": round(z_score, 2),
                "anomaly_type": anomaly_type,
                "severity": severity,
                "description": f"{'Unusually high' if z_score > 0 else 'Unusually low'} demand detected on {point.date}: {point.quantity} units (expected: {round(mean)} ± {round(std)})"
            })
    
    return {
        "product_name": request.product_name,
        "anomalies": anomalies,
        "total_anomalies": len(anomalies),
        "data_summary": {
            "mean": round(mean, 2),
            "std_dev": round(std, 2),
            "threshold": request.threshold,
            "data_points": len(request.data)
        }
    }

# ============================================
# SALES TREND ANALYSIS
# ============================================

class TrendRequest(BaseModel):
    data: List[SalesDataPoint]

@app.post("/api/trend-analysis")
async def analyze_trend(request: TrendRequest):
    """Analyze sales trends and seasonality"""
    if len(request.data) < 2:
        return {"trend": "insufficient_data", "message": "Need at least 2 data points"}
    
    quantities = [d.quantity for d in request.data]
    revenues = [d.revenue for d in request.data]
    
    # Trend calculation
    x = np.arange(len(quantities))
    qty_slope = np.polyfit(x, quantities, 1)[0]
    rev_slope = np.polyfit(x, revenues, 1)[0]
    
    qty_trend = "increasing" if qty_slope > 0.5 else "decreasing" if qty_slope < -0.5 else "stable"
    rev_trend = "increasing" if rev_slope > 0 else "decreasing" if rev_slope < 0 else "stable"
    
    # Growth rate
    if len(quantities) >= 2 and quantities[0] > 0:
        qty_growth = ((quantities[-1] - quantities[0]) / quantities[0]) * 100
    else:
        qty_growth = 0
    
    if len(revenues) >= 2 and revenues[0] > 0:
        rev_growth = ((revenues[-1] - revenues[0]) / revenues[0]) * 100
    else:
        rev_growth = 0
    
    # Volatility
    qty_cv = (np.std(quantities) / (np.mean(quantities) + 1)) * 100  # Coefficient of variation
    
    return {
        "quantity_trend": qty_trend,
        "revenue_trend": rev_trend,
        "quantity_growth_rate": round(qty_growth, 2),
        "revenue_growth_rate": round(rev_growth, 2),
        "volatility": round(qty_cv, 2),
        "volatility_level": "high" if qty_cv > 50 else "medium" if qty_cv > 25 else "low",
        "slope_per_period": round(qty_slope, 2),
        "summary": f"Quantity is {qty_trend} ({qty_growth:+.1f}%), Revenue is {rev_trend} ({rev_growth:+.1f}%). Volatility: {qty_cv:.1f}%"
    }

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ERP Pro AI Service", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3031)
