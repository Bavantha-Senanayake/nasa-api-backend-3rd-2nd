const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,    
        index:true,
    },
    lastname:{
        type:String,           
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
      password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:"user",
    },
    refreshToken:{
        type:String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
});
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
}); 
userSchema.methods.isPasswordMatched = async function(enteredPassword){   
    return await bcrypt.compare(enteredPassword,this.password);
};
//Export the model
module.exports = mongoose.model('User', userSchema);