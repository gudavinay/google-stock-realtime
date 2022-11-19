# google-finance-data
Google Realtime Stock Data API for real-time stock quotes from Google Finance.

We fetch information from the results posted in Google search page.

## Install
```
$ npm install google-stock-realtime --save
```

## Usage
```javascript
var realtimeStock = require("google-stock-realtime");

realtimeStock.getStockOverview("AAPL")
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err.stack ? err.stack : err));

/*
Output:
{
  "symbol": "AAPL",
  "open": 149.13,
  "high": 149.87,
  "low": 147.29,
  "marketCap": null,
  "peRatio": 24.34,
  "yield": 0.62,
  "cdpScore": "A-",
  "high52week": 182.94,
  "low52week": 129.04
}
*/

realtimeStock.getStockLastPrice("AAPL")
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err.stack ? err.stack : err));

/*
Output:
{
  "symbol": "AAPL",
  "realtimePrice": "$150.72",
  "profitLossPercentage": "1.30%",
  "profitLossToday": "+1.93 Today"
}
*/

realtimeStock.getMultipleStockLastPrice(["AAPL","TSLA","MSFT","NVDA"])
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err.stack ? err.stack : err));

/*
Output:
{
  "AAPL": {
    "stock": "AAPL",
    "realtimePrice": "$150.72",
    "profitLossPercentage": "1.30%",
    "profitLossToday": "+1.93 Today"
  },
  "TSLA": {
    "stock": "TSLA",
    "realtimePrice": "$183.17",
    "profitLossPercentage": "2.01%",
    "profitLossToday": "-3.75 Today"
  },
  "MSFT": {
    "stock": "MSFT",
    "realtimePrice": "$241.68",
    "profitLossPercentage": "0.021%",
    "profitLossToday": "-0.050 Today"
  },
  "NVDA": {
    "stock": "NVDA",
    "realtimePrice": "$156.77",
    "profitLossPercentage": "1.46%",
    "profitLossToday": "-2.33 Today"
  }
}
*/
```

## License
MIT license; see [LICENSE](./LICENSE).