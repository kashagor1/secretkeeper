require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const saltRounds = 10;


app.use(express.static("public"));
app.use(cookieParser());
app.use(session({
	secret: 'ajshdj3493u23', // Replace with your own secret key for session encryption
	resave: false,
	saveUninitialized: false,
}));
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
	email: String,
	password: String
});

const secData = new mongoose.Schema({
	message: String,
	username: String

})


const secuser = new mongoose.model("Secuser", userSchema);
const secm = new mongoose.model("secm", secData);


app.get('/', (req, res) => {
	res.render("home");
});

app.get("/login", (req, res) => {
	res.render("login");
});
app.get("/submit", (req, res) => {
	const user = req.session.user;

	if (user) {
		res.render("submit");
	} else {
		res.redirect('login');
	}
});
app.post("/submit", (req, res) => {
	let secret = req.body.secret;
	let uName = req.body.username;
	//console.log(req.session); // Print the entire req object to the console
	const user = req.session.user;

	if (user) {
		const newM = new secm({
			message: secret,
			username: user
		});
		//console.log(newM);
		newM.save((err) => {
			if (err)
				res.send("unable to same secrects");
			else {
				const data = {};


				secm.find({ username: user }, (err, result) => {
					if (err) {
						console.error('Error finding data:', err);
					} else {
						data.name = user;
						data.resultArray = result;
						res.render("secrets", data);
					}
				});
				//console.log(data);
			}
		})

	} else {
		res.redirect('login');
	}




})

app.get("/secrets", (req, res) => {
	const user = req.session.user;

	if (user) {
		res.render("submit");
	} else {
		res.redirect('login');
	}
});

app.post("/login", (req, res) => {
	let eil = req.body.username;
	let pa = req.body.password;
	secuser.findOne({ email: eil }, (err, foundUser) => {
		if (err) {
			console.log(err);
		} else {
			bcrypt.compare(pa, foundUser.password, function (err, result) {
				if (result === true) {
					req.session.user = eil;
					res.redirect("secrets");
				} else {
					res.send("Wrong password");
				}
			});
		}
	})
})

app.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log("Error destroying session:", err);
		} else {
			res.redirect("/home"); // Redirect the user to the login page after logout
		}
	});
})
app.get("/home",(req,res)=>{
	res.render('home');
})

app.get("/register", (req, res) => {
	res.render("register");
});
app.post("/register", (req, res) => {
	let eil = req.body.username;
	let pa = req.body.password;
	bcrypt.hash(pa, saltRounds, function (err, hash) {

		const newUser = new secuser({
			email: eil,
			password: hash
		});
		newUser.save((err) => {
			if (err) {
				console.log(err);
			} else {
				let data = {
					name:eil,
					resultArray : []
				};
				console.log(data);
				res.render("secrets",data);
			}
		})

	});

})

port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("server started on port " + port);
})