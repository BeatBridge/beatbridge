# BeatBridge

[Project Plan](https://docs.google.com/document/d/10cL8o_V6EtRxv_PyMGpTZMFerzGj634xrdXnpgyzLd8/edit)

## Table of Contents

- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Backend Routes](#backend-routes)
- [React Routes](#react-routes)
- [User Flows](#user-flows)
- [Setup](#setup)
- [Features](#features)
- [Future Work](#future-work)

## Introduction

BeatBridge is a music discovery application that combines the power of user experience and AI to recommend music based on user interactions. Developed as part of the Meta University Program's curriculum, BeatBridge offers a comprehensive suite of features for music enthusiasts to explore underground artists, tag, and share music. The app integrates securely with Spotify and provides a range of functionalities including real-time chat with other users, interactive music tagging, and AI-driven music recommendations.

## Problem Statement

### Discovering New and Niche Indie Artists for Music Enthusiasts

Many music enthusiasts, particularly those who enjoy niche genres or indie artists, find it challenging to discover new music that fits their unique tastes. Mainstream music recommendation algorithms like Spotify often fail to capture the subtle nuances of niche genres and indie music scenes.

**Detailed Problem Breakdown:**

- **Lack of Exposure:**
  - Niche and indie artists often don’t get the same exposure as mainstream artists, making it difficult for enthusiasts to find new music.
  - Traditional recommendation systems on popular streaming platforms may not effectively highlight these artists.

- **Personalization Challenges:**
  - Music recommendation algorithms tend to favor popular tracks and may not account for the unique preferences of niche music listeners.
  - Enthusiasts might feel their specific tastes are not adequately understood or catered to.

- **Community and Interaction:**
  - Music enthusiasts often seek recommendations from peers who share similar tastes.
  - Finding a community that appreciates the same niche genres can be challenging.

## Technologies Used

- **Frontend**: React
- **Backend**: Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT, bcrypt
- **APIs**: Spotify, MusicBrainz, GeoNames, Replicate, YoutubeMusic
- **Others**: WebSockets, Llama AI, Node.js

## Project Structure

```plaintext
.
├── backend
│   ├── routes
│   │   ├── userRoutes.js
│   │   ├── spotifyRoutes.js
│   │   ├── songRoutes.js
│   │   ├── playlistRoutes.js
│   │   ├── artistRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── ytMusicRoutes.js
│   │   └── utilityRoutes.js
│   ├── utils
│   │   ├── cronJobMap.js
│   │   ├── cronJobTrendingArtists.js
│   │   ├── cronJobRecommendation.js
│   │   ├── cronJobUpdateArtistImages.js
│   │   └── mailer.js
│   ├── middlewares
│   │   ├── authenticateJWT.js
│   │   └── spotifyTokenRefresh.js
│   ├── prisma
│   │   └── schema.prisma
│   ├── socket.js
│   └── index.js
├── frontend
│   ├── src
│   │   ├── components
│   │   └── App.js
│   └── index.html
└── README.md
```

## Database Schema

### User
```prisma
model User {
  id                    Int       @id @default(autoincrement())
  username              String    @unique
  email                 String    @unique
  password              String
  isVerified            Boolean   @default(false)
  isPremium             Boolean   @default(false)
  spotifyAccessToken    String?
  spotifyRefreshToken   String?
  songs                 Song[]
  locationId            Int?
  location              Location? @relation(fields: [locationId], references: [id])
  recommendation        Recommendation[]
  chatMessages          ChatMessage[]
  profilePicture        Bytes?
  sentDirectMessages    DirectMessage[] @relation(name: "DirectMessageSender")
  receivedDirectMessages DirectMessage[] @relation(name: "DirectMessageReceiver")
}
```

### Recommendation
```prisma
model Recommendation {
  id         Int       @id @default(autoincrement())
  userId     Int
  user       User      @relation(fields: [userId], references: [id])
  artistName String
  reason     String
  createdAt  DateTime  @default(now())
  feedback   String?
}
```

### Song
```prisma
model Song {
  id          Int       @id @default(autoincrement())
  title       String
  artist      String
  album       String
  genre       String
  mood        String
  tempo       String
  customTags  String?
  taggedAt    DateTime? @default(now())
  artistId    String?
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  createdAt   DateTime? @default(now())
  updatedAt   DateTime? @updatedAt
}
```

### Playlist
```prisma
model Playlist {
  id          Int       @id @default(autoincrement())
  spotifyId   String    @unique
  name        String
  description String?
  url         String
  images      Json
  tracks      Track[]
}
```

### Track
```prisma
model Track {
  id          Int       @id @default(autoincrement())
  spotifyId   String    @unique
  name        String
  album       String
  duration    Int
  playlistId  Int
  playlist    Playlist  @relation(fields: [playlistId], references: [id])
  artists     Artist[]  @relation("TrackToArtist")
}
```

### TrendingArtist
```prisma
model TrendingArtist {
  id              Int      @id @default(autoincrement())
  artistId        Int
  popularityScore Float    @default(0)
  createdAt       DateTime @default(now())
  momentum        Float
  date            DateTime @default(now())
  artist          Artist   @relation(fields: [artistId], references: [id])
}
```

### Artist
```prisma
model Artist {
  id          Int       @id @default(autoincrement())
  spotifyId   String    @unique
  name        String
  genres      String[]
  popularity  Int?
  followerCount Int?
  tracks      Track[]   @relation("TrackToArtist")
  locations   Location[] @relation("ArtistToLocation")
  trending    TrendingArtist[]
  artistSearches ArtistSearch[]
  imageUrl    String?
}
```

### Location
```prisma
model Location {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  countryCode String?
  latitude    Float
  longitude   Float
  pathData    String?
  artists     Artist[]  @relation("ArtistToLocation")
  users       User[]    @relation
}
```

### ArtistSearch
```prisma
model ArtistSearch {
  id          Int      @id @default(autoincrement())
  artistId    Int
  artist      Artist   @relation(fields: [artistId], references: [id])
  createdAt   DateTime @default(now())
}
```

### ChatMessage
```prisma
model ChatMessage {
  id          Int      @id @default(autoincrement())
  text        String
  response    String
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}
```

### DirectMessage
```prisma
model DirectMessage {
  id          Int      @id @default(autoincrement())
  senderId    Int
  receiverId  Int
  content     String
  createdAt   DateTime @default(now())
  sender      User     @relation(name: "DirectMessageSender", fields: [senderId], references: [id])
  receiver    User     @relation(name: "DirectMessageReceiver", fields: [receiverId], references: [id])
}
```

## Backend Routes

### User Routes
- `POST /signup` - User signup
- `POST /login` - User login
- `POST /verify-email` - Verify user email
- `GET /info` - Fetch user info (protected)

### Spotify Routes
- `GET /spotify/login` - Spotify login (protected)
- `GET /spotify/callback` - Spotify callback
- `POST /spotify/confirm` - Confirm Spotify login
- `POST /create-access-token` - Create Spotify access token (protected)
- `GET /spotify/global-top-50` - Fetch global top 50 songs on Spotify (protected)
- `GET /spotify/viral-50-global` - Fetch viral 50 global songs on Spotify (protected)
- `GET /spotify/search` - Search songs on Spotify (protected)
- `GET /spotify/featured-playlists` - Fetch featured playlists on Spotify (protected)
- `GET /spotify/playlists/:playlistId/tracks` - Fetch tracks of a playlist on Spotify (protected)
- `GET /spotify/tracks` - Fetch details of specific tracks on Spotify (protected)
- `GET /spotify/artists` - Fetch details of specific artists on Spotify (protected)

### Song Routes
- `POST /songs` - Create a new song (protected)
- `POST /songs/:songId/tags` - Add tags to a song (protected)
- `GET /songs/:songId` - Fetch details of a song (protected)

### Playlist Routes
- `GET /playlists` - Fetch all playlists (protected)
- `GET /playlists/:playlistId/tracks` - Fetch tracks of a playlist (protected)

### Artist Routes
- `GET /artists/genres` - Fetch genres of artists (protected)
- `GET /artists/least-popular` - Fetch least popular artists (protected)

### Recommendation Routes
- `GET /latest-recommendation` - Fetch the latest recommendation (protected)
- `POST /generate-recommendation` - Generate a new recommendation (protected)
- `GET /recommendation-history` - Fetch recommendation history (protected)
- `POST /recommendation-feedback` - Submit feedback for a recommendation (protected)

### Chat Routes
- `POST /chat-with-ai` - Chat with AI using Replicate (protected)
- `POST /chat-message` - Save chat message (protected)
- `GET /chat-messages` - Fetch chat messages (protected)

### Message Routes
- `GET /messages/:userId/:otherUserId` - Fetch messages between two users
- `POST /messages` - Send a new message

### YouTube Music Routes
- `GET /youtube-music/search` - Search music on YouTube

### Utility Routes
- `GET /genres-by-location` - Fetch genres by location
- `GET /protected-route` - Example of a protected route

## React Routes

- `/` - Landing page
- `/listener-dashboard` - Listener dashboard
- `/login` - Login page
- `/signup` - Signup page
- `/verify/:token` - Email verification page
- `/tagging-screen` - Tagging screen
- `/trending` - Trending screen
- `/profile` - Profile page
- `/friends` - Friends page
- `/favourites` - Favourites page
- `/settings` - Settings page
- `/chatbot` - Chatbot page
- `/map` - Map page
- `/trending-artists` - Trending artists page
- `/error` - Error handling page

## User Flows

1. **User Registration and Email Verification**
   - Users can sign up and receive a verification email to activate their account.

2. **Login and Authentication**
   - Users can log in to access their dashboards and other protected routes.

3. **Navigating Dashboards and Screens**
   - Different dashboards are available for listeners to manage their profiles and content.

4. **Chatbot Assistance**
   - Users can interact with an AI-powered chatbot for assistance and recommendations.

5. **Music Discovery and Tagging**
   - Users can search for music, play it, and tag it with predefined genres. CRUD operations are available for tags.

6. **Trending Music and Artists**
   - Users can see trending songs and artists, featured playlists, and visualize trending genres globally on a map.

7. **Recommendations**
   - Recommendations are generated every three hours based on user activity and user-based collaborative filtering. Users also have control over how the recommendation is generated by dynamically updating a slider to influence what factors should be taken into considering for the recommendation.

8. **Real-time Chat**
   - Users can chat live with other BeatBridge users, adding a social element to the music discovery experience.

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/beatbridge.git
   cd beatbridge
   ```

2. **Install dependencies:**
   ```bash
   npm install

   cd backend
   npm install @prisma/client bcrypt body-parser cors dotenv express jsonwebtoken node-cron node-fetch nodemon p-queue prisma-mock querystring replicate socket.io ws

   npm install --save-dev @types/jest jest jest-mock-extended prisma ts-jest

   cd ../frontend
   npm install @date-io/date-fns @fortawesome/fontawesome-svg-core @fortawesome/free-brands-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome axios bootstrap bootstrap-icons chart.js chartjs-adapter-moment date-fns dotenv express fs hamburger-react jsonwebtoken leaflet moment multer node-cron node-fetch nodemailer p-queue prisma-mock prop-types querystring react react-dom react-icons react-leaflet react-modal react-router-dom socket.io-client

   npm install --save-dev @types/react @types/react-dom @vitejs/plugin-react eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh jest vite
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the both directories and add necessary environment variables.

4. **Run the database server:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npx prisma studio
   ```

5. **Run the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

6. **Run the frontend server:**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open the application:**
   - Visit `http://localhost:5173` in your browser to see the application in action.

## Features

- **User Authentication**: Secure signup and login with email verification with options for password recovery.
- **Spotify Integration**: Login with Spotify to access personalized music recommendations and features.
- **Music Tagging**: Tag music with predefined genres and manage your tags.
- **Trending Music**: View trending songs and artists, and featured playlists.
- **Recommendations**: AI-powered music recommendations based on user activity.
- **Real-time Chat**: Chat live with other BeatBridge users.
- **AI Chatbot**: Get assistance and navigation help from an AI-powered chatbot.
- **Map Visualization**: Visualize trending genres globally on a map.

## Future Work

- **Enhanced Recommendation Algorithm**: Further improve the recommendation system.
- **Mobile App**: Develop a mobile application for iOS and Android platforms.
- **Social Features**: Add more social features like following other users and sharing playlists.
- **Live Events**: Integrate live music events and concerts into the platform.
- **Additional Music Services**: Expand integration to other music streaming services beyond Spotify.
