# NCSU PackFinder: Milestone 1 Report

* **Team Members:** Cole Sprouse, Mallory Varinoski, Ramisa Tafannum
* **Live Deployment:** https://csc342-507.csc.ncsu.edu/
  * Default page is not set yet, so this link will take you to the home page: https://csc342-507.csc.ncsu.edu/home.html
* **API Base URL:** https://csc342-507.csc.ncsu.edu/api

## What is Done

* Successfully set up the Docker Compose environment utilizing three distinct containers for the frontend, API, and Nginx reverse proxy.
* Configured the Nginx reverse proxy to route base traffic to the frontend container and /api/ traffic to the backend API container.
* Initialized the Node.js backend using Express and Nodemon to listen for incoming connections.
* Established an Express server for the frontend to successfully serve static assets including HTML, CSS, and JavaScript files, properly configured with absolute paths. 
* Created the HTML structures and dedicated CSS stylesheets for the Login, Home, Profile, Forum, Map, and Create Post pages. 
* Implemented a responsive frontend design that includes a mobile-friendly bottom navigation bar and a toggleable side drawer menu managed by JavaScript.
* Formatted mock JSON data files (`posts.json`, `users.json`, `locations.json`) to serve as payloads for the REST API.
* Modularized backend API routes (`users.js`, `items.js`, `locations.js`) using `express.Router()` to fulfill REST endpoint constraints.
* Eliminated hardcoded HTML data and implemented client-side rendering using `fetch()` to dynamically retrieve JSON data from the backend to populate the Forum, Profile, and Map pages.
* Successfully implemented the "Create Post" functionality, allowing the frontend to send a `POST` request to the API and dynamically update the Forum feed with new user-generated items.

## What is Not Done

* The Home page linked within the navigation menus has placeholders and still must implement interactive 'sneakpeeks'.
* The Map page correctly fetches location coordinates from the API but requires the integration of an actual interactive mapping library to replace the text list placeholder. 
* Interactive application features for updating the status of an item and viewing specific item details are pending implementation. 

## Pages and Implementation Status

| Pages | Status | Wireframe |
| :--- | :--- | :--- |
| Home | 50% (Needs Sneakpeeks & Javascript) | [Link to Home Wireframe](https://github.com/ncstate-csc-coursework/csc342-2026Spring-TeamG/blob/main/wireframes/mobile_home.png) |
| Interactive Map | 70% (Data fetched, Needs Map UI) | [Link to Map Wireframe](https://github.com/ncstate-csc-coursework/csc342-2026Spring-TeamG/blob/main/wireframes/mobile_map.png) |
| Lost & Found Forum | 100% (Fully dynamic client-side rendering complete) | [Link to Forum Wireframe](https://github.com/ncstate-csc-coursework/csc342-2026Spring-TeamG/blob/main/wireframes/mobile_forum.png) |
| User Profile | 100% (Client-side rendering complete) | [Link to Profile Wireframe](https://github.com/ncstate-csc-coursework/csc342-2026Spring-TeamG/blob/main/wireframes/mobile_profile.png) |
| Create New Post | 95% (UI and POST API integration complete) | [Link to Post Wireframe](https://github.com/ncstate-csc-coursework/csc342-2026Spring-TeamG/blob/main/wireframes/desktop_all.webp) |
| Item Details & Status | 0% (Not Implemented) | [Link to Feed Wireframe](https://github.com/ncstate-csc-coursework/csc342-2026Spring-TeamG/blob/main/wireframes/desktop_all.webp) |
| User Login/Register | 90% (Event Listeners & API connection complete) | [Link to Login Wireframe](https://github.com/ncstate-csc-coursework/csc342-2026Spring-TeamG/blob/main/wireframes/mobile_login.png) |

## REST API Endpoints 

The following endpoints are designed to support the decoupled frontend and backend using JSON-encoded responses. The routes are grouped by their functional domains within the PackFinder application.

| Method | Route | Description |
| :--- | :--- | :--- |
| POST | /users/register | Creates a new user account (student, faculty, or staff) and returns the new user object. |
| POST | /users/login | Authenticates a user's credentials and establishes a session. |
| POST | /users/logout | Terminates the current user's session. |
| GET | /users/profile | Retrieves the profile information for the currently authenticated user. |
| GET | /items | Retrieves a chronologically ordered array of lost and found posts. Accepts query parameters to filter by category (electronics, clothes, id) or location. |
| POST | /items | Creates a new post for a lost or discovered item. Expects a body containing precise geolocation coordinates, text description, category, and image file data. |
| GET | /items/:itemid | Retrieves the specific details, images, and current status of a single item using its ID. |
| PUT | /items/:item d/st atus | Updates the status of an existing item (e.g., changing from "Found" to "Turned In" at a campus desk). |
| GET | /locations/desks | Retrieves a static list of coordinates for official NCSU lost-and-found desks to populate the campus map. |

## Team Member Contributions 

#### Cole Sprouse 
* Documented Milestone 1 Report
* Documented all REST API Routes
* Modularized backend API architecture using `express.Router()` and established mock JSON data endpoints.
* Wrote client-side JavaScript to implement dynamic rendering across Forum, Profile, Map, and Login pages.
* Created the `post.html` view, configured the Express frontend route, and implemented the `fetch()` POST logic to dynamically update the mock feed.
* Refactored existing HTML templates to remove hardcoded mock data, ensuring full adherence to client-side rendering requirements.

#### Mallory Varinoski 
* Completed login page and profile page html
* Added some styling to login and profile page
* Cloned repository into the VM

#### Ramisa Tafannum
* Implemented & styled responsive navigation bar / header to be used across all pages except login
* Completed Forum html and styling, and created mock posts in posts.json
* Created Home and Map html with minimal styling and placeholders
* Edited and submitted screencast

## Milestone Effort Contribution

| Cole Sprouse | Mallory Varinoski | Ramisa Tafannum |
| :--- | :--- | :--- |
| 33% | 33% | 34% |

*(Note: Ensure these percentages reflect the work done for this specific milestone, not time spent, and sum up to 100%)*
