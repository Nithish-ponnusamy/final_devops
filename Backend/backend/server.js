// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import puppeteer from 'puppeteer';
import Sentiment from 'sentiment';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const YT_API_KEY = process.env.YT_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const sentiment = new Sentiment();

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
}));

// ----------------------
// Mongo Schemas
// ----------------------
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

// ----------------------
// Twitter Profile Route
// ----------------------
async function fetchTweets(page) {
    try {
        await page.waitForSelector('article', { timeout: 10000 });
        const tweets = await page.evaluate(() =>
            Array.from(document.querySelectorAll('article')).slice(0, 10).map(tweet => {
                const text = tweet.querySelector('div[lang]')?.innerText || '';
                const date = tweet.querySelector('time')?.getAttribute('datetime') || '';
                const likes = tweet.querySelector('div[data-testid="like"] span')?.innerText || '0';
                return { text, date, likes };
            })
        );

        return tweets.map(tweet => {
            const sentimentResult = sentiment.analyze(tweet.text);
            return {
                ...tweet,
                sentiment: sentimentResult.score,
                comparative: sentimentResult.comparative,
            };
        });
    } catch (err) {
        console.error('Error fetching tweets:', err);
        return [];
    }
}

async function fetchProfileData(username) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    try {
        await page.goto(`https://x.com/${username}`, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.r-n6v787', { timeout: 10000 });

        const profileData = await page.evaluate((username) => {
            const posts = document.querySelector('.r-n6v787')?.textContent || "0";
            const profilePhoto = document.querySelector('img[src*="profile_images"]')?.src || '';
            const following = document.querySelector(`a[href="/${username}/following"] span`)?.textContent || "0";
            const followers = document.querySelector(`a[href="/${username}/verified_followers"] span`)?.textContent || "0";
            const joinedDate = Array.from(document.querySelectorAll('span')).find(span => span.textContent.includes('Joined'))?.textContent || "N/A";
            const bio = document.querySelector('div[data-testid="UserDescription"]')?.innerText || '';
            return { posts, profile_photo: profilePhoto, following, followers, joined_date: joinedDate, bio };
        }, username);

        const tweets = await fetchTweets(page);
        await browser.close();
        return { ...profileData, tweets };
    } catch (err) {
        console.error("Twitter scraping failed:", err);
        await browser.close();
        return { error: "Failed to fetch profile." };
    }
}

app.post("/get_profile", async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    const data = await fetchProfileData(username);
    if (data.error) return res.status(400).json({ error: data.error });

    const saved = new Profile(data);
    await saved.save();

    res.json(data);
});

// ----------------------
// YouTube API Route
// ----------------------
app.get("/api/channel/:channelName", async (req, res) => {
    const { channelName } = req.params;

    try {
        const search = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: channelName,
                key: YT_API_KEY,
                type: 'channel',
            },
        });

        const channelId = search.data.items[0]?.id?.channelId;
        if (!channelId) return res.status(404).json({ error: 'Channel not found' });

        const [channelRes, videosRes] = await Promise.all([
            axios.get('https://www.googleapis.com/youtube/v3/channels', {
                params: {
                    part: 'statistics,snippet',
                    id: channelId,
                    key: YT_API_KEY,
                },
            }),
            axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    channelId,
                    maxResults: 5,
                    order: 'date',
                    type: 'video',
                    key: YT_API_KEY,
                },
            })
        ]);

        const info = channelRes.data.items[0];
        const stats = info.statistics;
        const snippet = info.snippet;

        const recentVideos = await Promise.all(videosRes.data.items.map(async (v) => {
            const videoId = v.id.videoId;
            const videoDetails = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'statistics,snippet',
                    id: videoId,
                    key: YT_API_KEY,
                },
            });
            const details = videoDetails.data.items[0];
            return {
                title: details.snippet.title,
                description: details.snippet.description,
                publishedAt: details.snippet.publishedAt,
                likes: details.statistics.likeCount,
                comments: details.statistics.commentCount,
                views: details.statistics.viewCount,
            };
        }));

        const channelData = {
            channelName: snippet.title,
            channelThumbnail: snippet.thumbnails.default.url,
            totalViews: stats.viewCount,
            totalSubscribers: stats.subscriberCount,
            totalVideos: stats.videoCount,
            recentVideos,
        };

        await new YouTubeChannel(channelData).save();
        res.json(channelData);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'YouTube API error' });
    }
});

// ----------------------
// Gemini Chatbot
// ----------------------
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([message]);
        const reply = result.response.text();
        res.json({ reply });
    } catch (err) {
        console.error("Chat error:", err.message);
        res.status(500).json({ error: "Chat processing error" });
    }
});

app.listen(PORT, () => console.log(`🌐 Server running on http://localhost:${PORT}`));
