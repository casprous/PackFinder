# NCSU PackFinder

PackFinder is a full-stack Progressive Web App (PWA) designed to centralize lost-and-found tracking across the North Carolina State University campus. Built to function reliably even in campus dead zones, it features an interactive geolocation map, a real-time threaded forum, native push notifications, and a robust offline background sync engine.

# Quick Start: Running Locally with Docker

Since the original university VM deployment is no longer active, the easiest way to run PackFinder is locally using Docker. The application is fully containerized, separating the frontend, Express API, MariaDB database, and Nginx reverse proxy into distinct services.

### Prerequisites
Docker
Docker Compose

### Installation Steps

## 1. Clone the Repository
git clone https://github.com/your-username/PackFinder.git  
cd PackFinder

## 2. Configure Environment Variables

Create a .env file in the root directory to define your database credentials and VAPID keys for push notifications:

### Database Configuration
DB_HOST=db  
DB_PORT=3306  
MYSQL_DATABASE=packfinder  
MYSQL_USER=admin  
MYSQL_PASSWORD=your_secure_password  
MYSQL_ROOT_PASSWORD=your_root_password  

### JWT Secret
API_SECRET_KEY=your_super_secret_jwt_key

### Web Push VAPID Keys (Generate using web-push CLI)
VAPID_SUBJECT=mailto:your_email@example.com  
VAPID_PUBLIC_KEY=your_public_key  
VAPID_PRIVATE_KEY=your_private_key  

## 3. Build and Launch the Containers
docker compose up --build

Note: On the first startup, the MariaDB container will automatically run the 01-schema.sql and 02-data.sql scripts to initialize the tables and seed the database with mock NCSU locations and items.

# Access the Application

Open your browser and navigate to:

http://localhost

The Nginx reverse proxy will automatically route frontend traffic and direct /api/* requests to the Node.js backend.

# Core Technologies
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3, Leaflet.js
- **Backend:** Node.js, Express.js
- **Database:** MariaDB (Relational, strictly raw SQL without an ORM)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **PWA:** Service Workers, Cache API, IndexedDB, Web Push API
- **Infrastructure:** Docker, Docker Compose, Nginx Reverse Proxy

# Primary Contributions (Cole Sprouse)

As a core engineer on this project, I architected the application's offline persistence layer, backend security, and cross-platform notification systems.

### Progressive Web App (PWA) & Offline Engineering
- **Offline App Shell & Caching:** Authored the service-worker.js utilizing the Cache API with a Cache-First strategy, allowing the entire application interface to load instantly without a network connection.
- **IndexedDB Background Sync:** Engineered a custom syncQueue utilizing IndexedDB. If a user loses connection while traversing campus, they can still draft posts, attach images, and submit replies. The system intercepts these actions, queues the payloads (including File objects compressed via the HTML5 Canvas API), and automatically flushes them to the MariaDB backend the moment network connectivity is restored.

### Cross-Platform Notifications
- **OS-Level Web Push:** Successfully implemented native Web Push Notifications using VAPID key encryption, the Push API, and Service Workers. This allows users to receive native device notifications (on both desktop and supported mobile ecosystems) when their lost items receive updates, even when the browser is closed.
- **In-App Notification Feed:** Built a database-driven notification system featuring a centralized feed and real-time unread badge counters across the app navigation.

### Backend Architecture & Security
- **Stateless Authentication:** Implemented secure user authentication and authorization using JSON Web Tokens (JWT) and bcryptjs. Built custom Express middleware to act as a gatekeeper for protected API routes.
- **Database Migration & Refactoring:** Led the migration from mock JSON files to a persistent MariaDB relational database. Handled connection pooling, implemented transaction logic for complex multi-table inserts, and refactored the schema to support unlimited threaded replies in the forum.
- **File Processing:** Integrated multer middleware to handle multipart/form-data image uploads, securely storing assets locally while saving their references in the database.
- **Access Control:** Locked down sensitive endpoints, such as status updates, to ensure strict owner-only modification rights, returning 403 Forbidden for unauthorized attempts.
