var express = require('express')
const scraper = require('./scraper')

var app = express()

app.get('/stories', async function (req, res) {
    result = await scraper.parseLatestCnetArticles()
    // result = await scraper.parseArticle('https://www.cnet.com/news/best-meat-delivery-deals-for-july-4th/')
    res.send(result)
})

app.get('/pdf', async function (req, res) {
    result = await scraper.printPDFArticle(decodeURIComponent(req.query.url))
    res.setHeader('Content-disposition', 'inline; filename="' + new Date().getTime() + '"');
    res.setHeader('Content-type', 'application/pdf');
    res.send(result)
})

app.get('/screenshot', async function (req, res) {
    result = await scraper.screenshotArticle(decodeURIComponent(req.query.url))
    res.setHeader('Content-disposition', 'inline; filename="' + new Date().getTime() + '"');
    res.setHeader('Content-type', 'image/jpeg');
    res.send(result)
})

app.listen(3000)