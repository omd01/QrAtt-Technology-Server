import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({

    name: {
    type: String,
    required: true,
    },

    email: {
    type: String,
    required: true,
    unique:true,
    },
    
    password: {
    type: String,
    required: true,
    minlength: [8,"Password must be atleast 8 characters long."],
    select: false,
    },

    avatar: {
        public_id: String,
        url: String,
    },

    mobile:{
        type: String,
        required: true,
    },

    parentsMob:{
        type: String,
        required: true,
    },

    roomNo:{
        type:Number,
        required:true,
    },
    
    branch:{
        type:String,
        require:true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    verified:{
        type: Boolean,
        default: false,
    },

    token:{
        type:String,
        default:null,
    },

    otp:Number,
    otp_expiry: Date,
    resetPasswordOtp:Number,
    resetPasswordOtpExpiry: Date,
  
});

userSchema.index({otp_expiry: 1}, {expireAfterSeconds: 0});



userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
   
    next();
})


userSchema.methods.getJWTToken = function() {
    return jwt.sign({ _id: this._id }, process.env.JWT_KEY,
         { expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000, });

}

userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password, this.password);
    
} 



export const User = mongoose.model("User", userSchema,"User");

