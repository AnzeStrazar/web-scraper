# Web Scraper API

This API contains a simple implementation of web page scraper.

### Run HTTP API Server
_Note: You will need Node.js along with npm package manager installed on your machine in order to run API server locally._

By running `npm install` we install all needed dependencies.

By running `npm run start` we run HTTP API Server. API is exposed on port: 3000.

### HTTP Endpoints

`GET: /stories` returns JSON array with a summary of the five latest stories from the webpage https://www.cnet.com/.

`GET: /pdf` returns pdf of story.

`GET: /screenshot` returns full page screenshot image of story.