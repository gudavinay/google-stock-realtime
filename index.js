'use strict';

const puppeteer = require('puppeteer');

const getStockOverview = async (symbol) => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36");

    const symbolPrefix = ["", "NYSE:", "NASDAQ:"];
    symbol = symbol.toUpperCase();
    let fetchError = null;

    for (let prefix of symbolPrefix) {

        try {
            const rsp = await page.goto('https://www.google.com/search?q=' + prefix + symbol);

            if (rsp.status() !== 200) {
                continue;
            }
            const sectionSelector = 'div#knowledge-finance-wholepage__entity-summary > div.aviV4d > div > g-card-section:nth-child(2) > div > div';
            await page.waitForSelector(sectionSelector, { timeout: 500 });
            const sectionElements = await page.$$(sectionSelector);
            const tableRowElements = await page.$$('div#knowledge-finance-wholepage__entity-summary > div.aviV4d > div > g-card-section:nth-child(2) > div > div > div > table > tbody > tr');

            const stockData = { symbol };

            if (sectionElements.length >= 3) {
                stockData.companyName = await parseTextContent(sectionElements[0]);
                stockData.ticker = (await parseTextContent(sectionElements[1])).replace(" ", ""); // remove space
                stockData.last = parseNumber((await parseTextContent(sectionElements[2])).split(" ")[0]); // remove USD
            }

            for (let row of tableRowElements) {
                const rowData = await row.$$("td");
                const field = await parseTextContent(rowData[0]);
                const value = await parseTextContent(rowData[1]);

                switch (field) {
                    case 'Open': stockData.open = parseNumber(value); break;
                    case 'High': stockData.high = parseNumber(value); break;
                    case 'Low': stockData.low = parseNumber(value); break;
                    case 'P/E ratio': stockData.peRatio = parseNumber(value); break;
                    case 'Div yield': stockData.yield = parseNumber(value.replace("%", "")); break;
                    case 'Prev close': stockData.prevClose = parseNumber(value); break;
                    case '52-wk high': stockData.high52week = parseNumber(value); break;
                    case '52-wk low': stockData.low52week = parseNumber(value); break;
                    case 'Mkt cap': stockData.marketCap = parseNumber(value); break;
                    default: break;
                }

                if (field.includes("CDP score"))
                    stockData.cdpScore = value;

            }
            if (Object.keys(stockData).length < 9) {
                continue;
            }
            browser.close();
            return stockData;
        }
        catch (err) {
            fetchError = err;
        }
    }
    browser.close();
    throw new Error(`unable to fetch data for ${symbol}`, fetchError);
};

function parseTextContent(element) {
    return element.getProperty('textContent').then(property => property.jsonValue());;
}

function parseNumber(value) {
    const number = (value === "-") ? null : 1 * value;
    return number;
}


const getStockLastPrice = async (symbol) => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36");

    const symbolPostfix = [":NASDAQ", ":NYSE"];
    symbol = symbol.toUpperCase();
    let fetchError = null;

    for (let postfix of symbolPostfix) {

        try {
            const rsp = await page.goto('https://www.google.com/finance/quote/' + symbol + postfix);

            if (rsp.status() !== 200) {
                continue;
            }

            const stockData = { symbol };

            const handles = await page.$$('.rPF6Lc'); // The div encapsulating all three details
            for (const element of handles) {
                const realtimePrice = await page.evaluate(el => el.querySelector("div > span > div > div").textContent, element);
                stockData.realtimePrice = realtimePrice;

                const profitLossPercentage = await page.evaluate(el => el.querySelector("div > div:nth-child(2) > div > span > div").textContent, element);
                stockData.profitLossPercentage = profitLossPercentage;

                const profitLossToday = await page.evaluate(el => el.querySelector("div > div:nth-child(2) > div > span:nth-child(2)").textContent, element);
                stockData.profitLossToday = profitLossToday;
            }

            if (Object.keys(stockData).length !== 4) {
                continue;
            }

            browser.close();
            return stockData;
        }
        catch (err) {
            fetchError = err;
        }
    }
    browser.close();
    throw new Error(`unable to fetch data for ${symbol}`, fetchError);
};

const getMultipleStockLastPrice = async (symbol) => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36");

    const symbolPostfix = ":NASDAQ";
    // symbol = symbol.toUpperCase();
    let fetchError = null;
    let resp = {};
    for (let stock of symbol) {
        stock = stock.toUpperCase();
        resp[stock] = {};
        try {
            const rsp = await page.goto('https://www.google.com/finance/quote/' + stock + symbolPostfix);

            if (rsp.status() !== 200) {
                continue;
            }

            const stockData = { stock };

            const handles = await page.$$('.rPF6Lc'); // The div encapsulating all three details
            for (const element of handles) {
                const realtimePrice = await page.evaluate(el => el.querySelector("div > span > div > div").textContent, element);
                stockData.realtimePrice = realtimePrice;

                const profitLossPercentage = await page.evaluate(el => el.querySelector("div > div:nth-child(2) > div > span > div").textContent, element);
                stockData.profitLossPercentage = profitLossPercentage;

                const profitLossToday = await page.evaluate(el => el.querySelector("div > div:nth-child(2) > div > span:nth-child(2)").textContent, element);
                stockData.profitLossToday = profitLossToday;
            }
            resp[stock] = stockData;
        }
        catch (err) {
            fetchError = err;
        }
    }
    browser.close();
    if(Object.keys(resp).length > 0){
        return resp;
    }else{
        throw new Error(`unable to fetch data for ${symbol}`, fetchError);
    }

};

exports.getStockOverview = getStockOverview;
exports.getStockLastPrice = getStockLastPrice;
exports.getMultipleStockLastPrice = getMultipleStockLastPrice;
