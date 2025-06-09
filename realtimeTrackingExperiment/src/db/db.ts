import {
  MongoClient,
  Db,
  Collection,
  Document,
  MongoNetworkError,
  MongoNetworkTimeoutError,
  ServerApiVersion,
} from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const password = encodeURIComponent("Atlas_Medoc");
const username = encodeURIComponent("team_medoc");
const host = encodeURIComponent("dbhospital.kfabsde.mongodb.net");
const options = `retryWrites=true&w=majority&appName=DBHospital`;

export const MONGODB_URI = process.env.MONGODB_URI ?? `mongodb+srv://${username}:${password}@${host}/?${options}`;
// Connection management variables
let mongoClient: MongoClient | null = null;
let isConnected = false;
let connectionTimeout: NodeJS.Timeout | null = null;
const IDLE_TIMEOUT = 60000; // Close connection after 60 seconds of inactivity
const MAX_POOL_SIZE = 10; // Limit maximum connections in the pool


// Create MongoDB client with optimized settings
function createMongoClient() {
  return new MongoClient(MONGODB_URI, {
    ssl: true,
    tls: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: MAX_POOL_SIZE, // Limit max connections
    minPoolSize: 1, // Minimum connections to maintain
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false, // Set to false to allow operations not in API v1
      deprecationErrors: true,
    }
  });
}

// Connect to MongoDB with lazy connection
export async function connectMongoDB() {
  try {
    if (isConnected && mongoClient) {
      // Reset the timeout if connection is already active
      resetConnectionTimeout();
      return mongoClient;
    }

    // Create new client if needed
    if (!mongoClient) {
      mongoClient = createMongoClient();
    }

    await mongoClient.connect();
    isConnected = true;
    console.log("Connected to MongoDB");

    // Set timeout to close connection after inactivity
    resetConnectionTimeout();

    return mongoClient;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    isConnected = false;
    mongoClient = null;
    throw error;
  }
}

// Reset the connection timeout
function resetConnectionTimeout() {
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
  }

  connectionTimeout = setTimeout(async () => {
    try {
      if (isConnected && mongoClient) {
        console.log("Closing idle MongoDB connection");
        await mongoClient.close();
        isConnected = false;
        mongoClient = null;
      }
      if(!isConnected) {
        console.log("MongoDB connection closed due to inactivity");
      }
    } catch (error) {
      console.error("Error closing idle MongoDB connection:", error);
    }
  }, IDLE_TIMEOUT);
}


// Close MongoDB connection
export async function closeMongoDB() {
  try {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }

    if (isConnected && mongoClient) {
      console.log("Closing MongoDB connection...");
      await mongoClient.close();
      console.log("MongoDB connection closed");
      isConnected = false;
      mongoClient = null;
    }
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
}

// Handle MongoDB errors with reconnection logic
export async function mongoErrorHandler(
  error: Error | any,
  message: string,
  message2: string
) {
  if (
    error instanceof MongoNetworkError ||
    error instanceof MongoNetworkTimeoutError
  ) {
    // Try to reconnect
    isConnected = false;
    await connectMongoDB().then(() => {
      console.error(message, error);
    });
  } else {
    console.error(message2, error, error.stack);
  }
}


// Get collection with auto-connect
export async function getCollection<T extends Document>(
  collectionName: string,
  dbname: string | undefined | null
): Promise<Collection<T>> {
  // Ensure connection is active
  if (!isConnected || !mongoClient) {
    await connectMongoDB();
  }

  // Reset timeout since we're using the connection
  resetConnectionTimeout();

  // Get database and collection
  if (!mongoClient) throw new Error("MongoDB client is not initialized");
  const db: Db = mongoClient.db(getDbName(dbname));
  return db.collection<T>(collectionName);
}


export function getDbName(dbname: string | undefined | null) {
  // Check if dbname is null, "null", undefined, or "undefined"
  if (dbname == null || dbname === "null" || dbname === "undefined" || !dbname) {
    if (process.env.NODE_ENV === "vital") {
      return "DemoDB"
    }
    return "TestDB"; // default database name
  } else {
    if (process.env.NODE_ENV === "vital") {
      return dbname + "_demo_db"; // Append suffix for consistency
    }
    return dbname + "_db"; // concatenate the provided name with "_db"
  }
}

// Disconnect function (retains for backward compatibility)
export async function disConnect() {
  await closeMongoDB();
}
