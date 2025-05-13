import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import Sentiment from 'sentiment';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const sentiment = new Sentiment();

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ✅ Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.108.179.90:3000'], // your frontend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors()); // handles preflight

app.use(bodyParser.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ✅ Mongoose Models
const Profile = mongoose.model("Profile", new mongoose.Schema({
  username: String,
  posts: String,
  profile_photo: String,
  following: String,
  followers: String,
  joined_date: String,
  bio: String,
  tweets: Array,
}));

const YouTubeChannel = mongoose.model("YouTubeChannel", new mongoose.Schema({
  channelName: String,
  channelThumbnail: String,
  totalViews: String,
  totalSubscribers: String,
  totalVideos: String,
  recentVideos: Array,
}));

// ✅ Helper: Fetch Tweets with Sentiment
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
      const result = new Sentiment().analyze(tweet.text);
      return { ...tweet, sentiment: result.score, comparative: result.comparative };
    });
  } catch (err) {
    console.error("Tweet extraction failed:", err);
    return [];
  }
}

// ✅ Twitter Scraping Endpoint
app.post("/get_profile", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto(`https://x.com/${username}`, { waitUntil: 'networkidle2' });

    const data = await page.evaluate((username) => {
      const posts = document.querySelector('.r-n6v787')?.textContent || "0";
      const profile_photo = document.querySelector('img[src*="profile_images"]')?.src || '';
      const following = document.querySelector(`a[href="/${username}/following"] span`)?.textContent || "0";
      const followers = document.querySelector(`a[href="/${username}/verified_followers"] span`)?.textContent || "0";
      const joined_date = Array.from(document.querySelectorAll('span')).find(span => span.textContent.includes('Joined'))?.textContent || "N/A";
      const bio = document.querySelector('div[data-testid="UserDescription"]')?.innerText || '';
      return { username, posts, profile_photo, following, followers, joined_date, bio };
    }, username);

    const tweets = await fetchTweets(page);
    await browser.close();

    const fullProfile = { ...data, tweets };
    await new Profile(fullProfile).save();

    res.json(fullProfile);
  } catch (err) {
    console.error("❌ Twitter scraping error:", err);
    await browser.close();
    res.status(500).json({ error: "Failed to fetch Twitter profile" });
  }
});

// ✅ YouTube Data Route
app.get("/api/channel/:channelName", async (req, res) => {
  const channelName = req.params.channelName;
  try {
    const searchResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        key: process.env.YT_API_KEY,
        part: "snippet",
        q: channelName,
        type: "channel"
      }
    });

    const channelId = searchResponse.data.items[0].id.channelId;
    const [channelDetails, videos] = await Promise.all([
      axios.get("https://www.googleapis.com/youtube/v3/channels", {
        params: {
          key: process.env.YT_API_KEY,
          part: "snippet,statistics",
          id: channelId
        }
      }),
      axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: process.env.YT_API_KEY,
          channelId,
          part: "snippet",
          order: "date",
          maxResults: 5
        }
      })
    ]);

    const stats = channelDetails.data.items[0].statistics;
    const snippet = channelDetails.data.items[0].snippet;

    const recentVideos = await Promise.all(videos.data.items.map(async (v) => {
      const videoId = v.id.videoId;
      const videoDetails = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          key: process.env.YT_API_KEY,
          part: "statistics,snippet",
          id: videoId
        }
      });
      const info = videoDetails.data.items[0];
      return {
        title: info.snippet.title,
        description: info.snippet.description,
        publishedAt: info.snippet.publishedAt,
        likes: info.statistics.likeCount,
        comments: info.statistics.commentCount,
        views: info.statistics.viewCount
      };
    }));

    const channelData = {
      channelName: snippet.title,
      channelThumbnail: snippet.thumbnails.default.url,
      totalViews: stats.viewCount,
      totalSubscribers: stats.subscriberCount,
      totalVideos: stats.videoCount,
      recentVideos
    };

    await new YouTubeChannel(channelData).save();
    res.json(channelData);
  } catch (err) {
    console.error("❌ YouTube error:", err.message);
    res.status(500).json({ error: "Failed to fetch channel" });
  }
});

// ✅ Gemini AI Chat Endpoint
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([message]);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error("❌ Chat error:", err.message);
    res.status(500).json({ error: "Gemini chat error" });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
