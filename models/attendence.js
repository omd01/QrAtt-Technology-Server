import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,
        },

    name:{
        type: String,
        required: true,
        },

    gate: {
        type: String,
        required: true,
    },

    action: {
        type: String,
        required: true,
    },
    
    uniqueCode: {
        type: String,
        required: true,
    },

    selfi:{
        public_id: String,
        url: String,
    },

    actionAt:{
        type:Date,
        default: Date.now
    },
   

});

export const Attendence = mongoose.model("Attendence", userSchema, "Attendence");