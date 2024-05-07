const User=require('../models/userModel');
const token=require('../config/jwtToken');
const asyncHandler=require('express-async-handler');
//const generateToken=require('../config/jwtToken');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt=require('jsonwebtoken');
//const validateMongodbId=require('../utils/validateMonogodbId');
//cretae a user
const createUser=asyncHandler(async(req,res)=>{
    const email=req.body.email;
    const findUser=await User.findOne({email:email});
    if(!findUser){
        const newUser = await User.create(req.body);
        res.json(newUser);
    }else{
        throw new Error('User already exists');
    }  
});
//login user
const loginUserCtrl=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
   //check if user exists or not
   const findUser=await User.findOne({email});
   if(findUser && (await findUser.isPasswordMatched(password))){
    const refreshToken= await generateRefreshToken(findUser?._id);
    const updateaUser=await User.findByIdAndUpdate(
        findUser._id,
        {
            refreshToken:refreshToken
        },
        {
            new:true
        });
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            maxAge:72*60*60*1000,
           
        });        
    res.json({
            _id:findUser?._id,
            firstname:findUser?.firstname,
            lastname:findUser?.lastname,
            email:findUser?.email,
            mobile:findUser?.mobile,
            token:token.generateToken(findUser?._id),
       });
    }else{
        throw new Error('Invalid email or password');
    }
});
//handle refresh token
const handleRefreshToken=asyncHandler(async(req,res)=>{
const cookie=req.cookies;
//console.log(cookie);
if(!cookie.refreshToken)
    throw new Error('no refresh token in cookie');
    const refreshToken=cookie.refreshToken;
    //console.log(refreshToken);
    const user=await User.findOne({refreshToken:refreshToken});
    if(!user)
        throw new Error('no refresh token presen in db ir noit mathcerd');
    jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded)=>{
        if(err || user.id!==decoded.id){
            throw new Error('token error');
        }
          const accessToken=token.generateToken(user._id);    
            res.json({
                accessToken,
            
        }); 
});
});

//logout user
const logoutUser=asyncHandler(async(req,res)=>{ 
    const cookie=req.cookies;
    if(!cookie.refreshToken)
        throw new Error('no refresh token in cookie');
    const refreshToken=cookie.refreshToken;
    const user=await User.findOne({refreshToken:refreshToken});  
    if(user){
        res.clearCookie('refreshToken',{
            httpOnly:true,
            secure:true,
        });
        return res.status(204).json({message:'logout successfully'});
    }
    await User.findOneAndUpdate(refreshToken,{refreshToken:null});
    res.clearCookie('refreshToken',{
        httpOnly:true,
        secure:true,
    });
    res.status(204).json({message:'logout successfully'});
});

//get all users
const getallUsers=asyncHandler(async(req,res)=>{
   try{
       const getUsers=await User.find({});
       res.json(getUsers);
    }catch(error){  
        throw new Error(error);
    }
});
//get a single user
const getSingleUser=asyncHandler(async(req,res)=>{
    try{
        const getUser=await User.findById(req.params.id);
        res.json(getUser);
    }catch(error){
        throw new Error(error);
    }
});
//delete a user 
const deleteaUser=asyncHandler(async(req,res)=>{
    try{
        const deleteaUser=await User.findByIdAndDelete(req.params.id);
        res.json(deleteaUser);
    }catch(error){
        throw new Error(error);
    }
});
//update a user
const updateaUser=asyncHandler(async(req,res)=>{
    
    try{
        const updateUser=await User.findByIdAndUpdate(req.user.id,req.body,{
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            mobile:req.body.mobile,
        },
        {
            new:true
        }
        );
        res.json(updateUser);   
    }catch(error){
        throw new Error(error);
    }
});


module.exports={logoutUser,handleRefreshToken,createUser,loginUserCtrl,getallUsers,getSingleUser,deleteaUser,updateaUser}; 