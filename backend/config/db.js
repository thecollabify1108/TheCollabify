const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 8+ handles these options automatically
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Drop old unique index on instagramUsername (no longer needed)
    try {
      const CreatorProfile = conn.connection.collection('creatorprofiles');
      await CreatorProfile.dropIndex('instagramUsername_1');
      console.log('✅ Dropped old instagramUsername unique index');
    } catch (indexError) {
      // Index might not exist, that's fine
      if (indexError.code !== 27) { // 27 = index not found
        console.log('ℹ️ instagramUsername index already removed or does not exist');
      }
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
