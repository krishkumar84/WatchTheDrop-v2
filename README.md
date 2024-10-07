# WatchTheDrop

**WatchTheDrop** is a full-stack price tracking application developed during a 24-hour hackathon at IIT Jodhpur. The platform monitors prices on e-commerce websites like Amazon and Flipkart, predicts future price drops using machine learning models, and provides real-time notifications to users. The project integrates several technologies including web scraping, server actions, and Redis for efficient data storage and rate limiting.

## Features

- **Price Tracking**: Monitor product prices on Amazon and Flipkart.
- **Price Prediction**: Machine learning models predict future price trends.
- **Real-time Notifications**: Users are alerted when price drops are detected.
- **Web Scraping**: Efficient data extraction from multiple e-commerce platforms.
- **User Authentication**: Next.js Server Actions are used for authentication and session management.
- **Rate Limiting**: Redis is utilized to manage requests and prevent overuse.
- **Graphical Price History**: Track price changes over time using dynamic charts.

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer
- **Backend**: Node.js, Server Actions
- **Database**: MongoDB
- **Web Scraping**: Custom scraping scripts to fetch product data
- **Machine Learning**: Price prediction using models
- **Caching & Rate Limiting**: Redis
- **Authentication**: Next.js Server Actions with Redis-based sessions

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/watchthedrop.git
   cd watchthedrop
   npm install
   npm run dev

## Usage

1. Open the app in your browser at [http://localhost:3000](http://localhost:3000).
2. Create an account to start tracking prices on Amazon and Flipkart.
3. Add products to your watchlist, and the app will scrape the prices regularly.
4. Receive notifications when there are significant price drops.
5. View graphical charts for product price history and future predictions based on machine learning models.

## Architecture

- **Next.js Server Actions**: Used for handling sensitive server-side operations like authentication and price tracking requests.
- **Redis**: Used for caching and rate-limiting requests to prevent abuse of web scraping.
- **MongoDB**: Stores user data, watchlists, and price histories.
- **Web Scraping**: Scrapers retrieve real-time product data from Amazon and Flipkart.
- **Machine Learning**: Implements price prediction models for future trends.

## Contributing

Contributions are welcome! Follow the steps below to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add some NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a pull request.
   

