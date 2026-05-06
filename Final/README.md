# Final Team Project

## NCSU PackFinder

## Progress Report

### Completed Features

* **PWA Installability:** Added a Web App Manifest (`manifest.json`), scalable SVG logo, app icons, and theme colors to allow users to install PackFinder directly to their device home screens.
* **Offline App Shell:** Implemented a Service Worker with the Cache API to successfully cache all HTML, CSS, and JS files, allowing the app UI to load instantly without a network connection.
* **Offline Reading(IndexedDB):** Integrated IndexedDB to cache API GET requests. Users can view the most recent lost-and-found forum feed and map data even while walking through campus dead zones.
* **Background Sync(Offline Writing):** Engineered a `syncQueue` within IndexedDB. If a user creates a post or updates a status while offline, the payload (including images via `File` objects) is stored locally. Global event listeners automatically detect when the user reconnects to the network and silently flush the queue to the MariaDB backend.
* **Graceful Degradation:** Added an `offline.html` fallback and dynamic UI banners that alert users when they lose their connection and restrict features intelligently.
* **Core Application:** Fully implemented JWT authentication, MariaDB relational database integration, Leaflet.js interactive maps, image uploading via `multer`, and real-time status updates from previous milestones.
* **In-App Notifications:** Created a dedicated notification system tracking post replies and status updates, featuring a centralized feed (`notifications.html`) and real-time unread badge counters across the app navigation.
* **Web Push Notifications:** Implemented cross-platform, OS-level push notifications utilizing the Web Push Protocol, VAPID key encryption, and Service Worker push events. Users can opt-in to receive native device buzzes when their items receive updates, even when the app is closed.
* **Unlimited Threaded Replies:** Overhauled the database schema from a single-reply column to a dedicated `Reply` table, allowing unlimited user comments on forum items.
* **Color-Coded Map Markers:** Implemented custom SVG map markers for each item status (Lost, Found, Turned In) and L&F Desk locations, matching the map legend colors using Leaflet's divIcon API.
* **Map Search Bar:** Implemented a functional live search bar on the map page with a dropdown suggestion list. Selecting a result animates the map to the corresponding marker, highlights it with a pulse ring, and opens its popup.
* **Forum Search Bar:** Implemented a functional search bar on the forum page that filters posts in real time by title or username without requiring additional API calls.
* **Status Update Authorization:** Restricted the status update endpoint so only the original post owner can change their item's status, returning a 403 for unauthorized attempts.

### Known Issues & Limitations

* **Item Details View:** The standalone, dedicated "Item Details" page was not fully implemented as initially wireframed; instead, we opted to display all item details, images, and status controls inline within the dynamic Forum feed for a smoother mobile experience.

## Authentication & Authorization

Our application uses stateless session management via **JSON Web Tokens (JWT)**. 
* **Storage:** When a user registers, their password is salted and hashed using `bcryptjs` before being stored in the persistent MariaDB database. Upon successful login, the server issues a signed JWT, which the client stores locally in the browser's `localStorage`.
* **Security & Access Control:** We utilize custom Express middleware (`auth.js`) that acts as a gatekeeper for private routes (like creating a post or modifying a status). This middleware extracts the `Bearer` token from the request header and verifies its signature using a hidden `API_SECRET_KEY` stored in our `.env` file. If the token is valid, it attaches the decoded user ID to the request, ensuring users can only perform authorized actions without the server needing to maintain stateful session memory.

## PWA Capabilities

* **Pages & Navigation:** The app consists of `login.html`, `home.html`, `map.html`, `forum.html`, `profile.html`, `post.html`, and `notifications.html`. Users navigate via a responsive top navbar (desktop), a bottom icon bar (mobile), and a toggleable side drawer.
* **Offline Functionality:** * Users can load the entire application interface offline.
  * Users can browse the most recently fetched forum posts and map desk locations offline.
  * Users can draft new posts (including attaching images) or reply to items while offline; these actions are saved and automatically synced to the server upon reconnection.
* **Caching Strategy:**
  * **Static Assets(App Shell):** We use a *Cache First, Fallback to Network* strategy in our Service Worker for HTML, CSS, and JS. This ensures lightning-fast load times.
  * **API Data:** We bypass the Service Worker for API requests. Instead, client-side JS intercepts these using a *Network First, Fallback to IndexedDB* strategy. We chose IndexedDB over the Cache API for data because it allows us to structure the records, easily store `File` objects (images) offline alongside text payloads, and iteratively queue/dequeue offline POST actions.

## API Documentation

Method | Route                 | Description
------ | --------------------- | ---------
`POST` | `/users/register`     | Receives username, email, and password, hashes the password with bcrypt, and creates a new user in the database.
`POST` | `/users/login`        | Authenticates a user's credentials against the database and returns a signed JWT token.
`POST` | `/users/logout`       | Terminates the user's session from the frontend perspective.
`GET`  | `/users/profile`      | **(Protected)** Retrieves the profile information for the currently authenticated user based on their JWT.
`PUT`  | `/users/profile/username` | **(Protected)** Updates the current user's username in the database and issues a fresh JWT.
`PUT`  | `/users/profile/password` | **(Protected)** Updates and hashes a new password for the current user.
`GET`  | `/items`              | Retrieves an array of lost and found posts from the database using JOINs, fully populated with an array of their associated replies.
`POST` | `/items`              | **(Protected)** Creates a new post. Accepts `multipart/form-data` including an image file. Uses SQL transactions to update Item, Location, and User_Items tables simultaneously.
`GET`  | `/items/:itemId`      | Retrieves the specific details of a single item using its ID.
`PUT`  | `/items/:itemId/status` | **(Protected)** Updates the status of an existing item and triggers notifications for the post owner.
`POST` | `/items/:itemId/replies`| **(Protected)** Inserts a new reply to a specific item post into the `Reply` table and triggers notifications for the post owner.
`GET`  | `/notifications`      | **(Protected)** Retrieves all in-app notifications for the authenticated user and calculates the unread badge count.
`PUT`  | `/notifications/:id/read` | **(Protected)** Marks a specific notification as read in the database.
`POST` | `/notifications/subscribe`| **(Protected)** Saves a client's Web Push Subscription object to the database.
`GET`  | `/locations/desks`    | Retrieves coordinates for official NCSU lost-and-found desks from the database.

## Database ER Diagram

![er diagram](../ER_Diagram/ERDiagram.png)

## Team Member Contributions

#### Cole Sprouse

* **Final:** 
** Engineered the complete PWA offline experience.
** Authored `service-worker.js` utilizing the Cache API to store the App Shell.
** Created `idb.js` to integrate IndexedDB for caching API responses (offline read) and queuing offline `POST`/`PUT` requests (offline write). 
** Built global online/offline listeners to automatically flush the `syncQueue` to the MariaDB backend upon network reconnection. 
** Designed the scalable SVG logo and implemented `manifest.json` for app installability. 
** Architected and implemented a comprehensive notification system, including an in-app database-driven notification feed with unread badges, and cross-platform OS-level Web Push Notifications using the Push API, Service Workers, and VAPID keys. 
** Refactored the database schema to support one-to-many item replies.

* **Milestone 2:** 
** Implemented JWT authentication, `bcryptjs` hashing, and Express authorization middleware. 
** Migrated the backend to a MariaDB relational database using connection pooling and transaction logic. 
** Implemented `multer` for image uploading via `FormData`. 
** Integrated the Leaflet map into the Create Post form.

* **Milestone 1:** 
** Modularized backend API architecture using `express.Router()`. 
** Wrote client-side JavaScript to implement dynamic rendering across all pages. 
** Created the `post.html` view and `fetch()` POST logic to dynamically update the mock feed.

#### Ramisa Tafannum

* **Final:** Built interactive search and navigation features, including a live map search with dropdown suggestions that animates to markers and opens popups, and a real-time forum search filtering posts by title or username. Enhanced map visualization with color-coded SVG markers for item statuses using Leaflet’s divIcon API. Implemented the missing GET /items/:itemId route and added owner-only authorization to the status update endpoint. Added a collapsible 'How it works' section to the forum page.
* **Milestone 2:** Integrated the Leaflet.js library into the map page to replace static placeholders with a fully interactive map. Wrote dynamic JavaScript to fetch and plot coordinates for official L&F desks and user-submitted items onto the Leaflet map. Implemented the Home page "sneakpeek" functionality.
* **Milestone 1:** Implemented & styled responsive navigation bar/header. Completed Forum HTML and styling. Created Home and Map HTML with placeholders. 

#### Mallory Varinoski

* **Final:** Updated the User schema and seed data to include email addresses for seeded users. Added timestamp tracking to relevant database tables. Researched to ensure all photo types were
  usable in our web application.
* **Milestone 2:** Designed the relational database schema without an ORM. Authored the `01-schema.sql` initialization script to generate database tables/columns upon container startup. Authored the `02-data.sql` script to populate the database with realistic mock data and iconic NCSU campus locations.
* **Milestone 1:** Completed login page and profile page HTML and CSS. Handled VM repository cloning.

#### Project Effort Contribution

Milestone   | Cole Sprouse  | Ramisa Tafannum | Mallory Varinoski
----------- | ------------- | ------------- | --------------
Proposal    | 34%           | 33%           | 33%
Milestone 1 | 33%           | 34%           | 33%
Milestone 2 | 34%           | 33%           | 33%
Final       | 34%           | 33%           | 33%
----------- | ------------- | ------------- | --------------
TOTAL:      | 135%           | 133%           | 132%
