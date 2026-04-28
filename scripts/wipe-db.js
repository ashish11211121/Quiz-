require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');

const wipeDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("MONGO_URI not found. Please set it in backend/.env");
        process.exit(1);
    }

    console.log("Connecting to Database...");
    await mongoose.connect(uri);
    
    console.log("Wiping Database Collections...");
    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      // We keep the categories and questions for production, but wipe users and matches
      if (['users', 'matches'].includes(collection.collectionName)) {
          await collection.deleteMany({});
          console.log(`Cleared ${collection.collectionName}`);
      }
    }
    
    console.log("Database wiped successfully. Test data removed. Ready for Production Launch.");
    process.exit(0);
  } catch (err) {
    console.error("Error wiping database:", err);
    process.exit(1);
  }
};

wipeDB();
