const mongoose=require('mongoose')
const url='mongodb://localhost:27017/userManagment'
const connect =mongoose.connect(url)
connect.then(()=>{
    console.log('success');
})
.catch (()=>{
    console.log('error');
})
const signup=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },role:{
        type:String,
        default:'user'
    }
},{timestamps:true})
const  signupData=new mongoose.model('users',signup)
module.exports=signupData
