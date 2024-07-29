import express from "express";
import yf from 'yahoo-finance2';

const app = express();

const port = process.env.PORT || 5000


app.get('/', (req, res) => {
    res.set('Content-Type', 'application/json');
    res.set('Cache-Control', 'public, max-age=86400');

    return res.json({
        message: "hello!"
    })
})

app.get('/query/:symbol', async (req, res) => {

    let symbol = req.params.symbol;

    if (!symbol || symbol == "") {
        return res.status(400).json({
            message: "Invalid Input"
        })
    }

    symbol = symbol.toUpperCase();

    try {
        const queryOptions = { modules: ['price', 'summaryProfile', 'financialData', 'defaultKeyStatistics', 'summaryDetail', 'recommendationTrend'] };
        const { price, summaryProfile, financialData, defaultKeyStatistics, summaryDetail, recommendationTrend } = await yf.quoteSummary(symbol, queryOptions);
        /**
         * 
         * price->shortName | marketCap
         * summaryProfile->sector | fullTimeEmployees
         * financialData->totalRevenue | profitMargins | revenueGrowth | revenuePerShare | debtToEquity | currentPrice | targetHighPrice | targetLowPrice | targetMeanPrice
         * summaryDetail -> fiftyTwoWeekLow | fiftyTwoWeekHigh | trailingPE | forwardPE 
         * defaultKeyStatistics -> 52WeekChange | trailingEps | forwardEps | bookValue | priceToBook
         * recommendationTrend -> trend[0]-> strongBuy | buy | hold | sell | strongSell
         * 
         *  */

        res.set('Content-Type', 'application/json');
        res.set('Cache-Control', 'public, max-age=86400');

        return res.json({
            name: price?.shortName || "",
            sector: summaryProfile?.sector || "",
            employee: summaryProfile?.fullTimeEmployees || "",
            marketCap: price?.marketCap || "",
            totalRevenue: financialData?.totalRevenue || "",
            profitMargin: financialData?.profitMargins || "",
            revenueGrowth: financialData?.revenueGrowth || "",
            revenuePerShare: financialData?.revenuePerShare || "",
            debtToEquityRatio: financialData?.debtToEquity || "",
            priceEarningRatio: summaryDetail?.trailingPE || "",
            forwardPriceEarningRatio: summaryDetail?.forwardPE || "",
            earningPerShare: defaultKeyStatistics?.trailingEps || "",
            forwardEarningPerShare: defaultKeyStatistics?.forwardEps || "",
            bookValue: defaultKeyStatistics?.bookValue || "",
            priceToBook: defaultKeyStatistics?.priceToBook || "",
            currentPrice: financialData?.currentPrice || "",
            targetPriceHigh: financialData?.targetHighPrice || "",
            targetPriceAverage: financialData?.targetMeanPrice || "",
            targetPriceLow: financialData?.targetLowPrice || "",
            priceLowestLastYear: summaryDetail?.fiftyTwoWeekLow || "",
            priceHighestLastYear: summaryDetail?.fiftyTwoWeekHigh || "",
            priceChangeLastYear: defaultKeyStatistics['52WeekChange'] || "",
            reconStrongBuy: recommendationTrend?.trend[0]?.strongBuy,
            reconBuy: recommendationTrend?.trend[0]?.buy,
            reconHold: recommendationTrend?.trend[0]?.hold,
            reconSell: recommendationTrend?.trend[0]?.sell,
            reconStrongSell: recommendationTrend?.trend[0]?.strongSell
        })

    } catch (err) {
        res.set('Content-Type', 'application/json');
        res.set('Cache-Control', 'private, no-cache, must-revalidate');
        return res.status(500).json({
            message: "Try again"
        })
    }
})

app.all('*', (req, res) => {
    res.set('Content-Type', 'application/json');
    res.set('Cache-Control', 'public, max-age=86400');

    return res.status(404).json({
        message: "Not Found"
    })
})

app.listen(port, () => {
    console.log(`server started at localhost:${port}`);
})