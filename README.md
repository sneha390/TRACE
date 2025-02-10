# TRACE
Trace: Detecting Unusual Drug Activity on Social Media

Hey There! 👋

Welcome to Trace, a project that tracks sketchy drug-dealing activities on social media by analyzing images and messages. We scrape real-time data from Telegram, Twitter, and WhatsApp to flag unusual patterns and help keep things clean.

This repo has two main parts:

Frontend: The UI to see all the cool (and important) data.

Backend: The brain behind data scraping, image/message analysis, and detecting shady stuff.

Project Structure

Trace/
├── frontend/       # The visual side of things
└── backend/        # Where the data magic happens

Frontend

The frontend is your window into all the action:

See detected drug-related messages

Analyze patterns from image data

Get reports and alerts

Built with modern web stuff for a smooth experience.

Backend

The backend handles the heavy lifting:

Data Scraping: Grabbing data from Telegram, Twitter, and WhatsApp

Data Processing: Breaking down images and text to find drug-related content

Anomaly Detection: Smart algorithms to spot weird patterns

Cool Features 🚀

Real-time Data Collection: Keeps the data fresh

Smart Detection: Analyzes both images and text to flag issues

Alerts & Reporting: Get notified when something fishy is found

Secure & Scalable: Built to handle big data safely

Getting Started

What You Need

Node.js (for the frontend)

Python 3.x (for the backend)

MongoDB (or your favorite database)

API keys for Telegram, Twitter, and WhatsApp (if needed)

Backend Setup

Go to the backend folder:

cd backend

Install the goodies:

pip install -r requirements.txt

Fire up the server:

python app.py

Frontend Setup

Jump into the frontend folder:

cd frontend

Install dependencies:

npm install

Start the frontend:

npm start

How to Use 🛠️

Start the backend to scrape and process data.

Open up the frontend to see what's going on.

Check out detected anomalies and alerts for sketchy stuff.

