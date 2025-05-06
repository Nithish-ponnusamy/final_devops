// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import puppeteer from 'puppeteer';
import Sentiment from 'sentiment';
import path from 'path';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5002;
const YT_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Replace with your key
const sentiment = new Sentiment();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

// MongoDB connection
mongoose.connect("mongodb+srv://<username>:<password>@cluster0.cbw99.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB error:'));
db.once('open', () => console.log('MongoDB connected'));

// Schemas
const Profile = mongoose.model('Profile', new mongoose.Schema({
    username: String,
    posts: String,
    profile_photo: String,
    following: String,
    followers: String,
    joined_date: String,
    bio: String,
    tweets: Array,
}, { timestamps: true }));

const YouTubeChannel = mongoose.model('YouTubeChannel', new mongoose.Schema({
    channelName: String,
    channelThumbnail: String,
    totalViews: String,
    totalSubscribers: String,
    totalVideos: String,
    recentVideos: [{
        title: String,
        description: String,
        publishedAt: Date,
        likes: Number,
        comments: Number,
        views: Number,
    }],
}, { timestamps: true }));

// Twitter Profile Scraper
async function fetchProfileData(username) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(`https://x.com/${username}`, { waitUntil: 'networkidle2' });

    const profileData = await page.evaluate(() => ({
        posts: document.querySelector('.r-n6v787')?.textContent || "0",
        profile_photo: document.querySelector('img[src*="profile_images"]')?.src || '',
        following: document.querySelector(`a[href*="/following"] span`)?.textContent || "0",
        followers: document.querySelector(`a[href*="/followers"] span`)?.textContent || "0",
        joined_date: Array.from(document.querySelectorAll('span')).find(span => span.textContent.includes('Joined'))?.textContent || "N/A",
        bio: document.querySelector('div[data-testid="UserDescription"]')?.innerText || '',
    }));

    const tweets = await page.evaluate(() =>
        Array.from(document.querySelectorAll('article')).slice(0, 10).map(tweet => ({
            text: tweet.querySelector('div[lang]')?.innerText || '',
            date: tweet.querySelector('time')?.getAttribute('datetime') || '',
            likes: tweet.querySelector('div[data-testid="like"] span')?.innerText || '0',
        }))
    );

    await browser.close();

    const analyzedTweets = tweets.map(tweet => {
        const result = sentiment.analyze(tweet.text);
        return { ...tweet, sentiment: result.score, comparative: result.comparative };
    });

    return { ...profileData, tweets: analyzedTweets };
}

app.post('/get_profile', async (req, res) => {
    const username = req.body.username;
    if (!username) return res.status(400).json({ message: 'Username is required' });

    const data = await fetchProfileData(username);
    const profile = new Profile(data);
    await profile.save();

    res.json(data);
});

// YouTube Stats
app.get('/api/channel/:channelName', async (req, res) => {
    const { channelName } = req.params;
    try {
        const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: { part: 'snippet', q: channelName, key: YT_API_KEY, type: 'channel' }
        });
        if (!searchRes.data.items.length) return res.status(404).json({ error: 'Channel not found' });

        const channelId = searchRes.data.items[0].id.channelId;
        const [channelStats, videoData] = await Promise.all([
            axios.get('https://www.googleapis.com/youtube/v3/channels', {
                params: { part: 'statistics,snippet', id: channelId, key: YT_API_KEY }
            }),
            axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: { part: 'snippet', channelId, maxResults: 5, order: 'date', type: 'video', key: YT_API_KEY }
            })
        ]);

        const channel = channelStats.data.items[0];
        const recentVideos = await Promise.all(videoData.data.items.map(async (video) => {
            const id = video.id.videoId;
            const details = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: { part: 'statistics,snippet', id, key: YT_API_KEY }
            });
            const info = details.data.items[0];
            return {
                title: info.snippet.title,
                description: info.snippet.description,
                publishedAt: info.snippet.publishedAt,
                likes: info.statistics.likeCount,
                comments: info.statistics.commentCount,
                views: info.statistics.viewCount
            };
        }));

        const newChannel = new YouTubeChannel({
            channelName: channel.snippet.title,
            channelThumbnail: channel.snippet.thumbnails.default.url,
            totalViews: channel.statistics.viewCount,
            totalSubscribers: channel.statistics.subscriberCount,
            totalVideos: channel.statistics.videoCount,
            recentVideos
        });
        await newChannel.save();

        res.json({ stats: newChannel, recentVideos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch channel data' });
    }
});

// Chatbot
const genAI = new GoogleGenerativeAI('YOUR_GEMINI_API_KEY'); // Replace with your key

app.post('/chat', async (req, res) => {
    const msg = req.body.message;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([msg]);
        res.json({ reply: result.response.text() });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Chatbot error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
