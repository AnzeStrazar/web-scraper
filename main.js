const express = require('express');
const scraper = require('./scraper');

var app = express();

// Get JSON array with summary of the five latest articles
app.get('/stories', async function (req, res) {
    result = await scraper.parseLatestCnetArticles();
    res.json(result);
})

// Get pdf of article.
app.get('/pdf', async function (req, res) {
    if (!req.query.url) {
        res.status(400).json({ error: 'Must provide URL parameter!' });
        return;
    }
    result = await scraper.getPdfArticle(decodeURIComponent(req.query.url));
    res.setHeader('Content-disposition', 'inline; filename="' + new Date().getTime() + '.pdf"');
    res.setHeader('Content-type', 'application/pdf');
    res.send(result);
})

// Get full page screenshot image of article.
app.get('/screenshot', async function (req, res) {
    if (!req.query.url) {
        res.status(400).json({ error: 'Must provide URL parameter!' });
        return;
    }
    result = await scraper.getScreenshotArticle(decodeURIComponent(req.query.url));
    res.setHeader('Content-disposition', 'inline; filename="' + new Date().getTime() + '.jpg"');
    res.setHeader('Content-type', 'image/jpeg');
    res.send(result);
})

app.listen(3000);