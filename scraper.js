const puppeteer = require('puppeteer-core');
const config = require('./config.json')

async function parseLatestCnetArticles() {
    const browser = await puppeteer.launch({
        headless: false, // Remove, if you want to have headless mode; by default puppeteer launch method have headless option true
        executablePath: '/usr/bin/google-chrome'
    });
    const page = await browser.newPage();

    // const link = 'https://www.google.com'; This way is maybe better? First declare link variable
    // await page.goto(link);

    await page.goto('https://www.cnet.com/');

    /** waitfor while loding the page, otherwise evaulate method will get failed. */
    const topStories = await page.evaluate(async () => {
        try {
            let data = []
            const list = document.querySelectorAll('.col-5 .col-4');
            for (i = 0; i < 5; i++) {
                let link = list[i].querySelector('a').href
                newsHeader = list[i].querySelector('a').innerText
                shortSummary = list[i].querySelector('p').innerText.trim()
                data.push({ link, newsHeader, shortSummary })
            }
            return data;
        } catch (error) {
            console.log(error)
        }
    })

    let results = []
    for (const story of topStories) {
        let result = await parseArticle(story.link, browser)
        result.newsHeader = story.newsHeader
        result.shortSummary = story.shortSummary
        results.push(result)
    }
    await browser.close();
    // console.log(results)
    return results

}

async function parseArticle(link, browser) {
    try {

        let shouldCloseBrowser = false

        if (!browser) {
            shouldCloseBrowser = true
            browser = await puppeteer.launch({
                headless: false, // Remove, if you want to have headless mode; by default puppeteer launch method have headless option true
                executablePath: '/usr/bin/google-chrome'
            });
        }

        const page = await browser.newPage()

        await page.goto(link)
        const url = new URL(link)
        var category = url.pathname.split('/')[1]

        const result = await page.evaluate(() => {
            let newsHeader = null
            let newsHeaderElement = document.querySelector('.speakableText')
            if (newsHeaderElement) {
                newsHeader = newsHeaderElement.innerText
            }

            let shortSummary = null
            let shortSummaryElement = document.querySelector('.c-head_dek')
            if (shortSummaryElement) {
                shortSummary = shortSummaryElement.innerText
            }

            let tagElements = document.querySelector('#article-body .tagList')
            let tags = []

            if (tagElements) {
                tagElements = tagElements.children

                for (const a of tagElements) {
                    if (a.innerText) {
                        tags.push(a.innerText)
                    }
                };
            }

            let authors = []
            let authorElements = document.querySelectorAll('.author')
            if (authorElements) {
                // author = authorElements.innerText
                for (const a of authorElements) {
                    authors.push(a.innerText)
                }
            }

            let publishTimeStamp = null
            let publishTimeStampElement = document.querySelector('.c-assetAuthor_date time')
            // If the article is in video category, then timestamp is associated with different class as in other
            if (!publishTimeStampElement) {
                publishTimeStampElement = document.querySelector('.info-timeDate time')
            }
            if (publishTimeStampElement) {
                publishTimeStamp = publishTimeStampElement.getAttribute('datetime')
            }


            let image = null
            let imageElement = document.querySelector('.imageContainer span img')
            if (imageElement) {
                image = imageElement.getAttribute('src')
            }

            return {
                newsHeader,
                shortSummary,
                tags,
                authors,
                publishTimeStamp,
                image
            }
        })

        result.category = category
        result.link = link
        result.pdfLink = config.frontURL + '/pdf?url=' + encodeURIComponent(link)
        result.screenshotLink = config.frontURL + '/screenshot?url=' + encodeURIComponent(link)

        if (shouldCloseBrowser) {
            await browser.close();
        }

        return result
    } catch (error) {
        console.log(error)
    }
}

async function printPDFArticle(link, browser) {
    try {

        let shouldCloseBrowser = false

        if (!browser) {
            shouldCloseBrowser = true
            browser = await puppeteer.launch({
                headless: true, // Remove, if you want to have headless mode; by default puppeteer launch method have headless option true
                executablePath: '/usr/bin/google-chrome'
            });
        }

        const page = await browser.newPage()

        await page.goto(link)
        const articlePDF = await page.pdf({ format: 'A4', printBackground: true })

        if (shouldCloseBrowser) {
            await browser.close();
        }

        return articlePDF
    } catch (error) {
        console.log(error)
    }
}

async function screenshotArticle(link, browser) {
    try {

        let shouldCloseBrowser = false

        if (!browser) {
            shouldCloseBrowser = true
            browser = await puppeteer.launch({
                headless: true, // Remove, if you want to have headless mode; by default puppeteer launch method have headless option true
                executablePath: '/usr/bin/google-chrome'
            });
        }

        const page = await browser.newPage()

        await page.goto(link)
        const articleScreenshot = await page.screenshot({ fullPage: true })

        if (shouldCloseBrowser) {
            await browser.close();
        }

        return articleScreenshot
    } catch (error) {
        console.log(error)
    }
}

exports.parseLatestCnetArticles = parseLatestCnetArticles
exports.parseArticle = parseArticle
exports.printPDFArticle = printPDFArticle
exports.screenshotArticle = screenshotArticle
