import mongoose from "mongoose";


const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in your environment variables. Please check your .env file.");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database Connected Successfully!");

        mongoose.connection.on('error', err => {
            console.error(`MongoDB connection error after initial connection: ${err}`);
        });

    } catch (error) {
        console.error(`Failed to connect to MongoDB: ${error.message}`);
        // Exit process with failure code, so the server doesn't start in a broken state.
        process.exit(1);
    }
};

export default connectDB;