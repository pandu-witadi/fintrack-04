require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/mongodb')

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI;

const start = async () => {
    try {
        // Connect to MongoDB
        await connectDB(MONGODB_URI)
        
        // Start the Fastify server
        await app.ready()
        await app.listen({ port: PORT, host: HOST })
        
        console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`)
        console.log(`Documentation available at http://localhost:${PORT}/documentation`)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    console.error(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    app.close(() => {
        console.log('💥 Process terminated!');
    });
});


start()