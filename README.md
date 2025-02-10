# Trace - Uncovering Drug Dealing Activities

**Trace** is a web application designed to identify and trace unusual drug dealing activities across various social media platforms like Telegram, Twitter, and WhatsApp. 

**Key Features:**

* **Real-time Data Scraping:** 
    * Continuously collects data (images, messages, user interactions) from target social media platforms.
    * Employs advanced scraping techniques to efficiently gather relevant information.
* **AI-Powered Analysis:** 
    * Utilizes machine learning models to analyze scraped data for patterns and anomalies indicative of drug dealing.
    * Identifies suspicious keywords, phrases, emojis, and image content.
    * Detects unusual user behavior and interactions.
* **Interactive Visualization:**
    * Presents analyzed data through intuitive dashboards and visualizations.
    * Enables easy exploration of trends, connections, and potential drug trafficking networks.
* **Alert System:** 
    * Generates real-time alerts for suspicious activities.
    * Notifies relevant authorities of potential drug dealing incidents.

**Project Structure:**

* **frontend:** 
    * Contains all the front-end code, including HTML, CSS, and JavaScript.
    * Implements the user interface for data visualization and interaction.
* **backend:** 
    * Handles data scraping, processing, and analysis.
    * Contains scripts for:
        * **Telegram scraping:** Extracts messages, user profiles, and media from Telegram groups and channels.
        * **Twitter scraping:** Gathers tweets, user profiles, and media related to drug-related keywords.
        * **WhatsApp scraping:** Collects messages, media, and user information from WhatsApp groups (with appropriate ethical considerations and user consent).
    * Implements machine learning models for data analysis and anomaly detection.
    * Integrates with a database to store and manage collected data.

**Note:**

* This project focuses on ethical and responsible data collection and analysis. 
* Ensure compliance with all applicable laws and regulations regarding data privacy and security.
* This project is for research and educational purposes only and should not be used for illegal activities.

**Getting Started:**

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
Install dependencies:

Bash

cd backend
pip install -r requirements.txt 
cd frontend
npm install 
Configure environment variables:

Create a .env file in the backend directory to store sensitive information like API keys, database credentials, etc.
Run the backend:

Bash

cd backend
python app.py 
Run the frontend:

Bash

cd frontend
npm start 
