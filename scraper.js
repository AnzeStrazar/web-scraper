const puppeteer = require('puppeteer');
const config = require('./config.json');

/* fffgf
 * jgngng
 *
*/
async function parseLatestCnetArticles() {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    await page.goto('https://www.cnet.com/');

    const topStories = await page.evaluate(async () => {
        try {
            const data = [];
            const list = document.querySelectorAll('.col-5 .col-4');
            for (i = 0; i < 5; i++) {
                const link = list[i].querySelector('a').href;
                const newsHeader = list[i].querySelector('a').innerText;
                const shortSummary = list[i].querySelector('p').innerText.trim();
                data.push({ link, newsHeader, shortSummary });
            }
            return data;
        } catch (error) {
            console.log(error);
        }
    })

    const results = [];
    for (const story of topStories) {
        const result = await parseArticle(story.link, browser);
        result.newsHeader = story.newsHeader;
        result.shortSummary = story.shortSummary;
        results.push(result);
    }
    await browser.close();
    return results

}

async function parseArticle(link, browser) {
    try {
        let shouldCloseBrowser = false;

        if (!browser) {
            shouldCloseBrowser = true;
            browser = await puppeteer.launch({});
        }

        const page = await browser.newPage();

        await page.goto(link);
        const url = new URL(link);
        const category = url.pathname.split('/')[1];

        const result = await page.evaluate(() => {
            let newsHeader = null;
            let newsHeaderElement = document.querySelector('.speakableText');
            if (newsHeaderElement) {
                newsHeader = newsHeaderElement.innerText;
            }

            let shortSummary = null;
            let shortSummaryElement = document.querySelector('.c-head_dek');
            if (shortSummaryElement) {
                shortSummary = shortSummaryElement.innerText;
            }

            const tags = [];
            let tagElements = document.querySelector('#article-body .tagList');
            // If the article is in video category, then timestamp is associated with different class as in other categories
            if (!tagElements) {
                tagElements = document.querySelector('#videoPage .videoTags');
            }
            if (tagElements) {
                tagElements = tagElements.children;

                for (const a of tagElements) {
                    if (a.innerText) {
                        tags.push(a.innerText);
                    }
                }
            }

            const authors = [];
            let authorElements = document.querySelectorAll('.author');
            if (authorElements) {
                for (const a of authorElements) {
                    authors.push(a.innerText);
                }
            }

            let publishTimeStamp = null;
            let publishTimeStampElement = document.querySelector('.c-assetAuthor_date time');
            // If the article is in video category, then timestamp is associated with different class as in other categories
            if (!publishTimeStampElement) {
                publishTimeStampElement = document.querySelector('.info-timeDate time');
            }
            if (publishTimeStampElement) {
                publishTimeStamp = publishTimeStampElement.getAttribute('datetime');
            }

            let image = null;
            let imageElement = document.querySelector('.imageContainer span img');
            if (imageElement) {
                image = imageElement.getAttribute('src');
            }

            return {
                newsHeader,
                shortSummary,
                tags,
                authors,
                publishTimeStamp,
                image
            }
        });

        result.category = category;
        result.link = link;
        result.pdfLink = config.frontURL + '/pdf?url=' + encodeURIComponent(link);
        result.screenshotLink = config.frontURL + '/screenshot?url=' + encodeURIComponent(link);

        if (shouldCloseBrowser) {
            await browser.close();
        }

        return result;
    } catch (error) {
        console.log(error);
    }
}

async function printPDFArticle(link, browser) {
    try {
        let shouldCloseBrowser = false;

        if (!browser) {
            shouldCloseBrowser = true;
            browser = await puppeteer.launch({});
        }

        const page = await browser.newPage();

        await page.goto(link);
        const articlePDF = await page.pdf({ format: 'A4', printBackground: true });

        if (shouldCloseBrowser) {
            await browser.close();
        }

        return articlePDF;
    } catch (error) {
        console.log(error);
    }
}

async function screenshotArticle(link, browser) {
    try {
        let shouldCloseBrowser = false;

        if (!browser) {
            shouldCloseBrowser = true;
            browser = await puppeteer.launch({});
        }

        const page = await browser.newPage();

        await page.goto(link);
        const articleScreenshot = await page.screenshot({ fullPage: true });

        if (shouldCloseBrowser) {
            await browser.close();
        }

        return articleScreenshot;
    } catch (error) {
        console.log(error);
    }
}

exports.parseLatestCnetArticles = parseLatestCnetArticles;
exports.parseArticle = parseArticle;
exports.printPDFArticle = printPDFArticle;
exports.screenshotArticle = screenshotArticle;
