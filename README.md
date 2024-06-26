# news-api
This API provides endpoints to fetch the latest and trending news from various sources by scrapping news website (in real time) including NDTV, Hindustan TImes, Times India.

api-link for latest-news  https://news-api-sooty.vercel.app/latest-news
## Endpoints

### Get Latest News

Fetches the latest news from multiple news sources.

- **URL**: `/latest-news`
- **Method**: `GET`
- **Query Parameters**:
  - `limit` (optional): Limit the number of news items returned. Default is 20.
- **Response Format**: JSON
- **Response Body**:
  ```json
  {
    "news": [
      {
        "title": "Title of the news",
        "shortDescription": "Short description of the news",
        "image": "URL of the news image",
        "link": "URL of the news article",
        "section": "Section/category of the news",
        "publishedTime": "Published time of the news",
        "website": "Name of the news website"
      },
      ...
    ],
    "totalNews": 100 // Total number of news items available
  }
