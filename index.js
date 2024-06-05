const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 3000;

const app = express();

const newsWebsites = [
    {
        name: 'NDTV',
        baseUrl: 'https://www.ndtv.com',
        latestNewsEndpoint: '/latest/page-1',
    },
    {
        name: 'NDTV',
        baseUrl: 'https://www.ndtv.com',
        latestNewsEndpoint: '/latest/page-2'

    },
    {
        name: 'NDTV',
        baseUrl: 'https://www.ndtv.com',
        latestNewsEndpoint: '/latest/page-2'

    },
    {
        name: 'India Today',
        baseUrl: 'https://www.indiatoday.in',
        latestNewsEndpoint: '/latest-news/',
    },
    {
        name: 'Hindustan Times',
        baseUrl: 'https://www.hindustantimes.com',
        latestNewsEndpoint: '/latest-news/',
    },
    
];

/**
 * Fetches the latest news from a given website.
 * @param {object} website - The website object containing the base URL and latest news endpoint.
 * @param {string} website.baseUrl - The base URL of the website.
 * @param {string} website.latestNewsEndpoint - The endpoint for fetching the latest news.
 * @returns {Promise<object>} - An object containing the array of news and the total number of news fetched.
 */
const getLatestNews = async (website) => {
    try {
        const response = await axios.get(website.baseUrl + website.latestNewsEndpoint);
        const $ = cheerio.load(response.data);
        const newsArray = [];
        let totalNews = 0;

        if (website.name === 'Hindustan Times') {
            $('div.cartHolder').each((index, element) => {
                totalNews++;
                const news = {
                    title: $(element).find('h3 a').text() ,
                    image: $(element).find('a img').attr('src'),
                    link: website.baseUrl + $(element).find('div a').attr('href'),
                    section: $(element).find('.secName a').text() || null,
                    publishedTime: $(element).find('.secTime').text().trim() ||null,
                    website: website.name,
                };
                if (!news.image) {
                    news.image = null;
                }
                newsArray.push(news);
            });
        }else if(website.name === 'NDTV'){
            $('div.news_Itm' || 'div.adBg').each((index, element) => {
                totalNews++;
                const news = {
                    title: $(element).find('h2 a').text() || null,
                    shortDescription: $(element).find('p').text() || null,
                    image: $(element).find('img').attr('src') || null,
                    link: $(element).find('h2 a').attr('href') || null,
                    section: $(element).find('.section').text() || null,
                    publishedTime: $(element).find('.posted-by').text().trim() || null,
                    website: website.name,
                };
                if (news.publishedTime && news.publishedTime.includes('|')) {
                    const publishedParts = news.publishedTime.split('|');
                    news.publishedTime = publishedParts[publishedParts.length - 1].trim();
                }
                if (!news.image) {
                    news.image = null;
                }
                newsArray.push(news);
            });
        }
        
        
        
        
        else if (website.name === 'India Today') {
            $('article.B1S3_story__card__A_fhi').each((index, element) => {
                totalNews++;
                const news = {
                    title: $(element).find('h2 a').text() || null,
                    shortDescription:  $(element).find('div p').text() || null,
                    image: $(element).find('img').attr('src') || null,
                    link: $(element).find('h2 a').attr('href') || null,
                    section: $(element).find('h4').text() || null,
                    publishedTime: $(element).find('.metadata').text().trim() || null,
                    website: website.name,
                };
                if (!news.image) {
                    news.image = null;
                }
                newsArray.push(news);
            });
        }

        return { newsArray, totalNews };
    } catch (error) {
        console.log(`Error fetching news from ${website.name}:`, error);
        return { newsArray: [], totalNews: 0 };
    }
};

app.get('/', (req, res) => {
    res.send('Welcome to the latest and trending news API');
});

app.get('/latest-news', async (req, res) => {
    try {
        const latestNewsPromises = newsWebsites.map(website => getLatestNews(website));
        const latestNewsResults = await Promise.all(latestNewsPromises);
        const limit = parseInt(req.query.limit) || 20;
        // Combine all news arrays and calculate the total number of news items
        const allLatestNews = [];
        let overallTotalNews = 0;
        latestNewsResults.forEach(result => {
            allLatestNews.push(...result.newsArray);
            overallTotalNews += result.totalNews;
        });
        // Sort all news by published time in descending order
        allLatestNews.sort((a, b) => new Date(b.publishedTime) - new Date(a.publishedTime));
        // Limit the number of news items to the requested limit
        allLatestNews.splice(limit);
        res.json({ news: allLatestNews, totalNews: overallTotalNews });
    } catch (error) {
        console.error('Error getting latest news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/trending-news', async (req, res) => {
    // Add similar logic for trending news as needed
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});