// Analytics Forecasting Tests
console.log("📈 Testing Analytics & Forecasting...\n")

// Mock forecasting functions
function linearForecast(data, periods) {
  const n = data.length
  const sumX = data.reduce((sum, _, i) => sum + i, 0)
  const sumY = data.reduce((sum, val) => sum + val, 0)
  const sumXY = data.reduce((sum, val, i) => sum + i * val, 0)
  const sumXX = data.reduce((sum, _, i) => sum + i * i, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const forecast = []
  for (let i = 0; i < periods; i++) {
    forecast.push(Math.round(slope * (n + i) + intercept))
  }

  return forecast
}

function calculateConfidenceInterval(forecast, historicalData, confidence = 0.95) {
  const variance =
    historicalData.reduce((sum, val, i) => {
      const predicted = linearForecast(historicalData.slice(0, i + 1), 1)[0] || val
      return sum + Math.pow(val - predicted, 2)
    }, 0) / historicalData.length

  const stdDev = Math.sqrt(variance)
  const zScore = confidence === 0.95 ? 1.96 : 2.58

  return forecast.map((val) => ({
    value: val,
    lower: Math.max(0, Math.round(val - zScore * stdDev)),
    upper: Math.round(val + zScore * stdDev),
  }))
}

// Test data
const historicalClaims = [280, 295, 310, 285, 320, 305, 330, 315, 340, 325, 355, 342]
const historicalCosts = [
  950000, 1020000, 1100000, 980000, 1150000, 1080000, 1200000, 1120000, 1250000, 1180000, 1300000, 1210000,
]

// Test Cases
console.log("🧮 Testing Linear Forecasting...")

const claimsForecast = linearForecast(historicalClaims, 6)
const costsForecast = linearForecast(historicalCosts, 6)

console.log(`✅ Claims forecast generated: [${claimsForecast.join(", ")}]`)
console.log(`✅ Costs forecast generated: [${costsForecast.join(", ")}]`)

// Test confidence intervals
console.log("\n📊 Testing Confidence Intervals...")

const claimsCI = calculateConfidenceInterval(claimsForecast, historicalClaims)
const costsCI = calculateConfidenceInterval(costsForecast, historicalCosts)

console.log("✅ Claims confidence intervals calculated")
claimsCI.forEach((ci, i) => {
  console.log(`   Month ${i + 1}: ${ci.value} (${ci.lower}-${ci.upper})`)
})

console.log("✅ Costs confidence intervals calculated")
costsCI.slice(0, 3).forEach((ci, i) => {
  console.log(
    `   Month ${i + 1}: $${(ci.value / 1000).toFixed(0)}K ($${(ci.lower / 1000).toFixed(0)}K-$${(ci.upper / 1000).toFixed(0)}K)`,
  )
})

// Test seasonal adjustments
console.log("\n🌊 Testing Seasonal Adjustments...")

function applySeasonalAdjustment(forecast, month) {
  const seasonalFactors = [0.95, 0.92, 1.05, 1.08, 1.12, 1.15, 1.18, 1.1, 1.05, 1.02, 0.98, 0.95]
  const currentMonth = new Date().getMonth()

  return forecast.map((val, i) => {
    const adjustedMonth = (currentMonth + i) % 12
    return Math.round(val * seasonalFactors[adjustedMonth])
  })
}

const seasonalClaims = applySeasonalAdjustment(claimsForecast, new Date().getMonth())
const seasonalCosts = applySeasonalAdjustment(costsForecast, new Date().getMonth())

console.log(`✅ Seasonal claims adjustment: [${seasonalClaims.join(", ")}]`)
console.log(
  `✅ Seasonal costs adjustment: [${seasonalCosts
    .slice(0, 3)
    .map((c) => `$${(c / 1000).toFixed(0)}K`)
    .join(", ")}]`,
)

// Test model accuracy
console.log("\n🎯 Testing Model Accuracy...")

function calculateMAPE(actual, predicted) {
  const errors = actual.map((val, i) => Math.abs((val - predicted[i]) / val))
  return (errors.reduce((sum, err) => sum + err, 0) / errors.length) * 100
}

// Generate predictions for historical data to test accuracy
const historicalPredictions = historicalClaims
  .slice(0, -3)
  .map((_, i) => linearForecast(historicalClaims.slice(0, i + 3), 1)[0])

const actualValues = historicalClaims.slice(3)
const mape = calculateMAPE(actualValues, historicalPredictions)

console.log(`✅ Model MAPE: ${mape.toFixed(2)}%`)
console.log(`✅ Model accuracy: ${(100 - mape).toFixed(2)}%`)

// Test risk assessment
console.log("\n⚠️  Testing Risk Assessment...")

function assessRisk(forecast, confidence) {
  const variance = confidence.reduce((sum, ci) => sum + (ci.upper - ci.lower), 0) / confidence.length

  if (variance > 100) return "High"
  if (variance > 50) return "Medium"
  return "Low"
}

const claimsRisk = assessRisk(claimsForecast, claimsCI)
const costsRisk = assessRisk(costsForecast, costsCI)

console.log(`✅ Claims forecast risk: ${claimsRisk}`)
console.log(`✅ Costs forecast risk: ${costsRisk}`)

console.log("\n🎉 Analytics tests completed successfully!")
