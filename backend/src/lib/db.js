import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    }).catch((error) => {
      console.error("Failed to connect to MongoDB", error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log(`Connected to MongoDB ${cached.conn.connection.host}`);
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};