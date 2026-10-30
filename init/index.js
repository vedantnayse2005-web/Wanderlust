const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGODB_URI = 'mongodb://localhost:27017/wanderlust';


main()
      .then (()=>{
        console.log("connection successful");
      })
      .catch ((err)=>{
        console.error("Error connecting to MongoDB:", err);
      });

      async function main(){
        await mongoose.connect(MONGODB_URI);
      }

      // Initialize the database with sample data
      const initDB = async () => {
       await Listing.deleteMany({})
      initData.data= initData.data.map((obj) => ({...obj, owner:"6ab94bc5e62ac18131bb1a29"}));

       
         await Listing.insertMany(initData.data);
         console.log("Database initialized with sample data");
      }

      initDB(); 
    