import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,
        },
    name: {
            type: String,
            required: true,
            },
    teacher: {
        type: String,
        required: true,
    },

    reason: {
        type: String,
        required: true,
    },
    
    from: {
        type: Date,
        required: true,
    },

    to:{
        type: Date,
        required: true,
     },

    status:{
        type:String,

    },
    createdAt:{
        type: Date,
        default: Date.now,
        required: true,
    }


});

export const Leav = mongoose.model("Leav", userSchema, "Leav");