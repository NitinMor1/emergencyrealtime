import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import ApiRouter from "./apiRouter";
import * as logger from './lohHandler';
import dotenv from 'dotenv';
import path from 'path';
import { AddressInfo } from "net";
import http from 'http';
import { createWebSocketServer } from "./utils/webSockets/webSocketsConfig";
import helmet from "helmet";
import { closeMongoDB, connectMongoDB, getCollection } from "./db/db";
// import { createWebSocketServer } from "./utils/webSockets/socket";
// Initialize environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Preserve original console methods
const originalConsoleLog = console.info;
const originalConsoleError = console.error;

// Initialize Express application
const app: Application = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
createWebSocketServer(server);

// Define allowed origins
const allowedOrigins = process.env.NODE_ENV === 'Prod' ? ['https://hospital.medoc.app','https://healthbackend.medoc.app/MedPlus', 'http://doctor.medoc.app'] : '*'

// Enhanced CORS configuration for Express
const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    transports: ['websocket'],
    maxAge: 86400 // CORS preflight cache time (24 hours)
};
// Override console methods for logging
console.info = function (...args) {
    const message = args.join(" , ");
    logger.info(message);
    originalConsoleLog(...args);
};

console.error = function (...args) {
    const message = args.join(" , ");
    logger.error(message);
    originalConsoleError(...args);
};

// Apply middleware
app.use(helmet());
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
app.use(express.json(/*{ limit: '10mb' }*/)); // Add request size limit
app.use(cors(corsOptions));

// Connection monitoring middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Skip for static resources or health checks
    if (req.path.startsWith('/health') || req.path.startsWith('/public')) {
        return next();
    }
    
    // Connect to MongoDB only when needed
    try {
        await connectMongoDB();
        
        // Add response finish listener to track when request completes
        res.on('finish', () => {
            // We don't close the connection here - it will auto-close after idle timeout
            // This is handled in the db.ts file
            
        });
        
        next();
    } catch (error) {
        console.error("MongoDB connection error in middleware:", error);
        return res.status(500).json({ error: 'Database connection error' });
    }
});

app.use((err: any, _: express.Request, res: express.Response, __: express.NextFunction) => {
    if (err.name === 'MulterError') {
        // Multer specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large. Max size is 5MB' });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: err.message });
        }
    }

    if (err.http_code && err.name === 'Error') {
        // Cloudinary or custom errors
        return res.status(500).json({ error: 'Cloudinary upload failed', detail: err.message });
    }

    // Fallback
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
});

// Routes
app.use("/api", ApiRouter);

app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

app.get('/dbString', (req, res) => {
    if(process.env.NODE_ENV === 'Prod'){
        res.status(200).json({
            message: 'Prod MongoDB connection string',
        })
    }else{
        res.status(200).json({ message: "Dev MongoDB connection string" });
    }
});

// Connection monitoring stats
let lastMonitoringTime = Date.now();
const MONITORING_INTERVAL = 60 * 60 * 1000; // Check every hour

async function monitorConnections() {
    try {
        const now = Date.now();
        if (now - lastMonitoringTime > MONITORING_INTERVAL) {
            // Log connection status every hour
            console.info("MongoDB connection check - idle connection management active");
            lastMonitoringTime = now;
        }
    } catch (err) {
        console.error("Error monitoring connections:", err);
    }
}

// Start connection monitoring
const monitoringInterval = setInterval(monitorConnections, MONITORING_INTERVAL);

// Start server
server.listen(PORT, () => {
    // Connect only when first needed, not at startup
    const address = server.address() as AddressInfo;
    console.info(`Server is running on http://localhost:${address.port}`);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
    console.log('Shutting down the app');
    clearInterval(monitoringInterval);
    await closeMongoDB();
    process.exit(0);
});