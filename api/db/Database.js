const mongoose = require("mongoose");
let instance = null;

class Database {

    constructor() {

        if(!instance){
            this.mongoConnection = null;
            instance = this;
        }

        return instance;

    }


    async connect(options){
        try {
            console.log("DB:", "Connecting...");
            let db = await mongoose.connect(options.CONNECTION_STRING);
            this.mongoConnection = db;
            console.log("DB:", "Connection established!");


        } catch(err){
            console.log("DB:", "Connection Failed!");
            console.error(err);
            process.exit(1);
        }   
    }



}

module.exports = Database;