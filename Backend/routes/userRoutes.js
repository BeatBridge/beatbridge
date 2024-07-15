require("dotenv").config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");
const fetch = require("node-fetch");
const authenticateJWT = require("../middlewares/authenticateJWT");
const { sendMail } = require("../utils/mailer");
const spotifyTokenRefresh = require("../middlewares/spotifyTokenRefresh");
const Replicate = require("replicate");
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    const verificationToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    const emailText = `Hello ${user.username}, please verify your email by clicking on the link: ${verificationUrl}`;

    sendMail(user.email, "Verify your email", emailText);

    res
      .status(201)
      .json({ user, message: "User created. Please verify your email." });
  } catch (error) {
    res.status(500).json({ error: "User could not be created." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user === null) {
      return res.status(403).json({ status: "bad username/password" });
    }
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.status(201).json({ status: "logged in", token: token });
    } else {
      return res.status(403).json({ status: "bad username/password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/verify-email", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { isVerified: true },
    });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
  }
});

router.get("/info", authenticateJWT, async (req, res) => {
  const userInfo = await prisma.user.findUnique({
    where: { username: req.user.username },
    select: {
      username: true,
      email: true,
      isPremium: true,
      spotifyAccessToken: true,
    },
  });

  if (userInfo === null) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(userInfo);
});

router.get("/spotify/login", authenticateJWT, (req, res) => {
  const state = jwt.sign(
    { id: req.user.id, username: req.user.username },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
  const scopes = "user-top-read user-read-private";
  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
      state: state,
    });
  res.redirect(authUrl);
});

router.get("/spotify/callback", async (req, res) => {
  const { code, state } = req.query;

  try {
    const decodedState = jwt.verify(state, process.env.JWT_SECRET);

    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      body: querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await fetch(authOptions.url, {
      method: authOptions.method,
      body: authOptions.body,
      headers: authOptions.headers,
    });

    const data = await response.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    await prisma.user.update({
      where: { id: decodedState.id },
      data: {
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
      },
    });

    const confirmationUrl = `${process.env.FRONTEND_URL}/spotify-confirmation?token=${state}`;
    res.redirect(confirmationUrl);
  } catch (error) {
    console.error("Error during Spotify callback:", error);
    res.redirect(`/error`);
  }
});

router.post("/spotify/confirm", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (user) {
      res.json({ status: "success" });
    } else {
      res.status(400).json({ error: "Invalid token or user not found" });
    }
  } catch (error) {
    console.error("Error verifying Spotify login:", error);
    res.status(500).json({ error: "Failed to verify Spotify login" });
  }
});

router.post("/create-access-token", authenticateJWT, async (req, res) => {
  const code = req.body.code || null;
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    method: "POST",
    body: querystring.stringify({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await fetch(authOptions.url, {
      method: authOptions.method,
      body: authOptions.body,
      headers: authOptions.headers,
    });
    const data = await response.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    // Save tokens in database for the user
    const user = await prisma.user.update({
      where: { username: req.user.username },
      data: {
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
      },
    });
    return res.json(user);
  } catch (error) {
    console.error(error);
    res.redirect(`/error`);
  }
});

router.get(
  "/spotify/global-top-50",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { username: req.user.username },
    });
    try {
      const playlistId = "37i9dQZEVXbMDoHDwVN2tF";
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${user.spotifyAccessToken}`,
          },
        }
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching global top 50:", error);
      res.status(500).json({ error: "Failed to fetch global top 50." });
    }
  }
);

router.get(
  "/spotify/viral-50-global",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { username: req.user.username },
    });
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/37i9dQZEVXbLiRSasKsNU9`,
        {
          headers: {
            Authorization: `Bearer ${user.spotifyAccessToken}`,
          },
        }
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching viral 50 global:", error);
      res.status(500).json({ error: "Failed to fetch viral 50 global." });
    }
  }
);

router.get(
  "/spotify/search",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { username: req.user.username },
    });

    const query = req.query.q;
    const type = "track";
    const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user.spotifyAccessToken}`,
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching songs:", error);
      res.status(500).json({ error: "Failed to search songs." });
    }
  }
);

//Direct API call
router.get(
  "/spotify/featured-playlists",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { username: req.user.username },
    });

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/browse/featured-playlists`,
        {
          headers: {
            Authorization: `Bearer ${user.spotifyAccessToken}`,
          },
        }
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching featured playlists:", error);
      res.status(500).json({ error: "Failed to fetch featured playlists." });
    }
  }
);

router.get(
  "/spotify/playlists/:playlistId/tracks",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const { playlistId } = req.params;
    const user = await prisma.user.findUnique({
      where: { username: req.user.username },
    });

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${user.spotifyAccessToken}`,
          },
        }
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
      res.status(500).json({ error: "Failed to fetch playlist tracks." });
    }
  }
);

router.get(
  "/spotify/tracks",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const { trackIds } = req.query;
    const user = await prisma.user.findUnique({
      where: { username: req.user.username },
    });

    if (!trackIds) {
      return res.status(400).json({ error: "No track IDs provided." });
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/tracks?ids=${trackIds}`,
        {
          headers: {
            Authorization: `Bearer ${user.spotifyAccessToken}`,
          },
        }
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching track details:", error);
      res.status(500).json({ error: "Failed to fetch track details." });
    }
  }
);

router.get(
  "/spotify/artists",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const { artistIds } = req.query;
    const user = await prisma.user.findUnique({
      where: { username: req.user.username },
    });

    if (!artistIds) {
      return res.status(400).json({ error: "No artist IDs provided." });
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/artists?ids=${artistIds}`,
        {
          headers: {
            Authorization: `Bearer ${user.spotifyAccessToken}`,
          },
        }
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching artist details:", error);
      res.status(500).json({ error: "Failed to fetch artist details." });
    }
  }
);

//cronJob
router.get("/playlists", authenticateJWT, async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany();
    res.json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists." });
  }
});

router.get(
  "/playlists/:playlistId/tracks",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const { playlistId } = req.params;

    try {
      const tracks = await prisma.track.findMany({
        where: { playlistId: parseInt(playlistId) },
        include: {
          artists: true,
        },
      });
      res.json(tracks);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      res.status(500).json({ error: "Failed to fetch tracks." });
    }
  }
);

router.get("/artists/genres", authenticateJWT, async (req, res) => {
  try {
    const artists = await prisma.artist.findMany({
      select: {
        spotifyId: true,
        name: true,
        genres: true,
      },
    });
    res.json(artists);
  } catch (error) {
    console.error("Error fetching artist genres:", error);
    res.status(500).json({ error: "Failed to fetch artist genres." });
  }
});

router.get("/genres-by-location", async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        countryCode: true,
        artists: {
          select: {
            genres: true,
          },
        },
      },
    });

    const result = locations.map((location) => {
      const genres = Array.from(
        new Set(location.artists.flatMap((artist) => artist.genres))
      );
      return {
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        countryCode: location.countryCode,
        genres,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching genres by location:", error);
    res.status(500).json({ error: "Failed to fetch genres by location." });
  }
});

router.post("/songs", authenticateJWT, async (req, res) => {
  const { title, artist, album, genre, mood, tempo, customTags } = req.body;
  try {
    const song = await prisma.song.create({
      data: {
        title,
        artist,
        album,
        genre,
        mood,
        tempo,
        customTags,
        userId: req.user.id,
      },
    });
    res.json(song);
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(500).json({ error: "Failed to create song." });
  }
});

router.post("/songs/:songId/tags", authenticateJWT, async (req, res) => {
  const { songId } = req.params;
  const { genre, mood, tempo, customTags } = req.body;
  try {
    const updatedSong = await prisma.song.update({
      where: { id: parseInt(songId) },
      data: {
        genre,
        mood,
        tempo,
        customTags: JSON.stringify(customTags),
        taggedAt: new Date(),
      },
    });
    res.json(updatedSong);
  } catch (error) {
    console.error("Error saving tags:", error);
    res.status(500).json({ error: "Failed to save tags." });
  }
});

router.get(
  "/songs/:songId",
  authenticateJWT,
  spotifyTokenRefresh,
  async (req, res) => {
    const { songId } = req.params;
    try {
      const song = await prisma.song.findUnique({
        where: { id: parseInt(songId) },
      });
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      console.error("Error fetching song details:", error);
      res.status(500).json({ error: "Failed to fetch song details." });
    }
  }
);

router.post("/track-artist-search", authenticateJWT, async (req, res) => {
  const { artistSpotifyId } = req.body;

  try {
    // Find the artist by Spotify ID
    const artist = await prisma.artist.findUnique({
      where: { spotifyId: artistSpotifyId },
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    // Use the artist's database ID
    await prisma.artistSearch.create({
      data: {
        artistId: artist.id, // Use the integer ID
      },
    });

    res.status(201).json({ message: "Artist search tracked successfully" });
  } catch (error) {
    console.error("Error tracking artist search:", error);
    res.status(500).json({ error: "Failed to track artist search" });
  }
});

router.get("/trending-artists", authenticateJWT, async (req, res) => {
  try {
    const trendingArtists = await prisma.trendingArtist.findMany({
      include: {
        artist: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    res.json(trendingArtists);
  } catch (error) {
    console.error("Error fetching trending artists:", error);
    res.status(500).json({ error: "Failed to fetch trending artists." });
  }
});

router.get("/protected-route", authenticateJWT, (req, res) => {
  res.json({ message: "This is a protected route" });
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

router.post("/chat-with-ai", async (req, res) => {
  const { prompt } = req.body;

  const contextPath = path.join(__dirname, '../utils/context.txt');
  const context = fs.readFileSync(contextPath, 'utf8');

  const input = {
    top_k: 50,
    top_p: 0.9,
    prompt,
    max_tokens: 512,
    min_tokens: 0,
    temperature: 0.6,
    prompt_template:
      `system\n\nYou are an AI assistant specialized in helping users with the Beats Bridge application(context: ${context}) User\n\n{prompt}Assistant\n\n`,
    presence_penalty: 1.15,
    frequency_penalty: 0.2,
  };
 

  try {

    let responseData = "";

    for await (const event of replicate.stream(
      "meta/meta-llama-3-70b-instruct",
      { input }
    )) {
      responseData += event.toString();
    }

    res.status(201).send(responseData);
  } catch (error) {
    console.error("Error in chat process:", error);
    res.status(500).send("Error in chat process.");
  }
});

module.exports = router;
