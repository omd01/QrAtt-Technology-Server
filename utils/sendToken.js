export const sendToken =(res,user,statusCode,message) =>{

    const token = user.getJWTToken();

    const options ={
        httpOnly : true
    }

    const userData = {
        _id : user._id,
        name : user.name,
        email : user.email,
        avatar : user.avatar,
        mobile : user.mobile,
        parentsMob : user.parentsMob,
        roomNo:user.roomNo,
        branch:user.branch,
        verified : user.verified,
        isTeacher : user.isTeacher,
        isAdmin: user.isAdmin,
    }

   return res
    .status(statusCode)
    .cookie("token",token,options)
    .json({success:true,message,user:userData})
;
}
