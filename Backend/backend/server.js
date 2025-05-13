import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import puppeteer from 'puppeteer';
import Sentiment from 'sentiment';
import path from 'path';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 5002;
const sentiment = new Sentiment();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.connection.once('open', () => {
    console.log('✅ Connected to MongoDB');
}).on('error', (err) => {
    console.error('MongoDB error:', err);
});

// Mongoose Schemas
const ProfileSchema = new mongoose.Schema({
    username: String,
    posts: String,
    profile_photo: String,
    following: String,
    followers: String,
    joined_date: String,
    bio: String,
    tweets: Array,
}, { timestamps: true });

const YouTubeChannelSchema = new mongoose.Schema({
    channelName: String,
    channelThumbnail: String,
    totalViews: String,
    totalSubscribers: String,
    totalVideos: String,
    recentVideos: [
        {
            title: String,
            description: String,
            publishedAt: Date,
            likes: Number,
            comments: Number,
            views: Number,
        },
    ],
}, { timestamps: true });

const Profile = mongoose.model('Profile', ProfileSchema);
const YouTubeChannel = mongoose.model('YouTubeChannel', YouTubeChannelSchema);

// ------------------- Twitter Profile Data --------------------
async function fetchProfileData(username) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Change if needed
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0');

    try {
        await page.goto(`https://x.com/${username}`, { waitUntil: 'networkidle2' });

        const profileData = await page.evaluate((username) => {
            const posts = document.querySelector('.r-n6v787')?.textContent || "0";
            const profilePhoto = document.querySelector('img[src*="profile_images"]')?.src || '';
            const following = document.querySelector(`a[href="/${username}/following"] span`)?.textContent || "0";
            const followers = document.querySelector(`a[href="/${username}/followers"] span`)?.textContent || "0";
            const joinedDate = Array.from(document.querySelectorAll('span')).find(span => span.textContent.includes('Joined'))?.textContent || "Unknown";
            const bio = document.querySelector('div[data-testid="UserDescription"]')?.innerText || '';
            return { posts, profile_photo: profilePhoto, following, followers, joined_date: joinedDate, bio };
        }, username);

        const tweets = await fetchTweets(page);
        await browser.close();

        return { ...profileData, tweets };

    } catch (err) {
        console.error('Error:', err);
        await browser.close();
        return { error: 'Failed to fetch Twitter profile.' };
    }
}

async function fetchTweets(page) {
    try {
        await page.waitForSelector('article', { timeout: 10000 });

        const tweets = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article')).slice(0, 10).map(tweet => {
                const text = tweet.querySelector('div[lang]')?.innerText || '';
                const date = tweet.querySelector('time')?.getAttribute('datetime') || '';
                const likes = tweet.querySelector('div[data-testid="like"] span')?.innerText || '0';
                return { text, date, likes };
            });
        });

        return tweets.map(tweet => {
            const result = sentiment.analyze(tweet.text);
            return { ...tweet, sentiment: result.score, comparative: result.comparative };
        });

    } catch (err) {
        console.error('Error fetching tweets:', err);
        return [];
    }
}

app.post('/get_profile', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });

    const profileData = await fetchProfileData(username);
    if (profileData.error) return res.status(400).json({ message: profileData.error });

    const newProfile = new Profile(profileData);
    await newProfile.save();

    res.json(profileData);
});

// ------------------- YouTube API --------------------
app.get('/api/channel/:channelName', async (req, res) => {
    const { channelName } = req.params;
    try {
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: channelName,
                type: 'channel',
                key: process.env.YT_API_KEY,
            },
        });

        if (searchResponse.data.items.length === 0)
            return res.status(404).json({ error: 'Channel not found' });

        const channelId = searchResponse.data.items[0].id.channelId;

        const channelData = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'statistics,snippet',
                id: channelId,
                key: process.env.YT_API_KEY,
            },
        });

        const item = channelData.data.items[0];
        const channelInfo = {
            channelName: item.snippet.title,
            channelThumbnail: item.snippet.thumbnails.default.url,
            totalViews: item.statistics.viewCount,
            totalSubscribers: item.statistics.subscriberCount,
            totalVideos: item.statistics.videoCount,
        };

        const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                channelId,
                maxResults: 5,
                order: 'date',
                type: 'video',
                key: process.env.YT_API_KEY,
            },
        });

        const recentVideos = await Promise.all(videosResponse.data.items.map(async (video) => {
            const details = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'statistics,snippet',
                    id: video.id.videoId,
                    key: process.env.YT_API_KEY,
                },
            });
            const v = details.data.items[0];
            return {
                title: v.snippet.title,
                description: v.snippet.description,
                publishedAt: v.snippet.publishedAt,
                likes: v.statistics.likeCount,
                comments: v.statistics.commentCount,
                views: v.statistics.viewCount,
            };
        }));

        const youtubeData = { ...channelInfo, recentVideos };
        const newYT = new YouTubeChannel(youtubeData);
        await newYT.save();

        res.json({ stats: channelInfo, recentVideos });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'YouTube API error' });
    }
});

// ------------------- Chatbot --------------------
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ error: "No message provided." });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([userMessage]);
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Chatbot error" });
    }
});

// Serve chatbot UI
app.get('/c', (req, res) => {
    res.sendFile(__dirname + '/public/chatbot.html');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
