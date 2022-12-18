import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.js';
import { Teacher } from '../models/teachers.js';
import { User } from '../models/users.js';

export const isAuthenticated = async (req ,res, next) =>{
    try {
        
      const {token} = req.cookies;

      if(!token){
            return res.status(401).json({
                success: false,
                message: "Login First"});
        }

        const decoded = jwt.verify(token,process.env.JWT_KEY);
         if(await User.findById(decoded._id)){
          req.user  = await User.findById(decoded._id);
        next();
         }
         else if(await Teacher.findById(decoded._id)){
          req.user = await Teacher.findById(decoded._id);
          next();
         }
         else{
          req.user = await Admin.findById(decoded._id);
          next();
         }
  
    } catch (error) {
      res.status(400).json({success:false, message: error.message});
    }
}

export const TisAuthenticated = async (req ,res, next) =>{
  try {
      
    const {token} = req.cookies;

    if(!token){
          return res.status(401).json({
              success: false,
              message: "Login First"});
      }

      const decoded = jwt.verify(token,process.env.JWT_KEY);   
      const  user = await Teacher.findById(decoded._id);
      if(!user.isTeacher)
      req.
      next();
  } catch (error) {
    res.status(400).json({success:false, message: error.message});
  }
}