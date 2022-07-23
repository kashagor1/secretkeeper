require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb://127.0.0.1:27017/secretsDB",{useNewUrlParser:true});



const userSchema = new mongoose.Schema({
	email:String,
	password:String
});

const enKey =  process.env.SECRECT_ENY;


userSchema.plugin(encrypt,{secret:enKey,encryptedFields:['password']});


const user =  new mongoose.model("User",userSchema);



app.get('/',(req,res)=>{
	res.render("home");
});

app.get("/login",(req,res)=>{
	res.render("login");
});

app.post("/login",(req,res)=>{
	let eil = req.body.username;
	let pa = req.body.password;
	user.findOne({email:eil},(err,foundUser)=>{
		if(err){
			console.log(err);
		}else{
			if(foundUser){
				if(foundUser.password=== pa){
					res.render("secrets");
				}
			}
		}
	})
})


app.get("/register",(req,res)=>{
	res.render("register");
});
app.post("/register",(req,res)=>{
	let eil = req.body.username;
	let pa    = req.body.password;
	const newUser = new user({
		email:eil,
		password:pa
	});
	newUser.save((err)=>{
		if(err){
			console.log(err);
		}else{
			res.render("secrets");
		}
	})
})

app.listen(3000,()=>{
	console.log("server started on port 3000");
})