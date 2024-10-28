Google Calendar Event Integration


This project integrates Google Calendar, allowing users to sign in with their Google accounts and create events directly on their Google Calendar.

Project Overview
With this application, users can:

Log in using their Google accounts.
Create and manage events that will be added to their Google Calendar.
Features
Google Account Integration: Secure login with Google using OAuth.
Event Creation: Users can create events, set event names, dates, and times, which will automatically sync with their Google Calendar.
Getting Started
Follow these steps to set up and run the project locally.

Prerequisites
Node.js and npm installed
Google Cloud Console account and project (for Google Calendar API and OAuth credentials)
Cloning the Project
First, clone the repository:

Client Setup
Navigate to the client folder:


cd client
Install dependencies:

npm install
Start the client application:

npm run dev


Server Setup
Open a new terminal and navigate to the server folder:

cd server
Install dependencies:

npm install
Start the server:

npm run dev

Configuration
Set up Google OAuth credentials in your Google Cloud Console.
Add your client ID and secret to environment variables in both client and server configurations.
Update any base URLs or API keys as needed.

Once the server and client are running:

Open your browser and go to http://localhost:3000 (or your specified port).

Log in with your Google account.
Start creating events that will be saved to your Google Calendar.

Technologies Used
React for the front end
Node.js and Express for the back end
Google Calendar API for event integration
OAuth2 for Google login authentication
