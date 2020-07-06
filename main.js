const express = require('express');
const scraper = require('./scraper');

var app = express();

app.get('/stories', async function (req, res) {
    result = await scraper.parseLatestCnetArticles();
    res.json(result);
})

app.get('/pdf', async function (req, res) {
    if (!req.query.url) {
        res.status(400).json({ error: 'Must provide URL parameter!' });
        return;
    }
    result = await scraper.printPDFArticle(decodeURIComponent(req.query.url));
    res.setHeader('Content-disposition', 'inline; filename="' + new Date().getTime() + '.pdf"');
    res.setHeader('Content-type', 'application/pdf');
    res.send(result);
})

app.get('/screenshot', async function (req, res) {
    if (!req.query.url) {
        res.status(400).json({ error: 'Must provide URL parameter!' });
        return;
    }
    result = await scraper.screenshotArticle(decodeURIComponent(req.query.url));
    res.setHeader('Content-disposition', 'inline; filename="' + new Date().getTime() + '.jpg"');
    res.setHeader('Content-type', 'image/jpeg');
    res.send(result);
})

app.listen(3000);