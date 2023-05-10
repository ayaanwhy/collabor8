require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.engine("html", require("ejs").renderFile);
app.use(express.static(__dirname + "/public"));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(3069, function () {
  console.log("SaaSBase Authentication Server listening on port 3069");
});

const mongoose = require("mongoose");

const db = "mmongodb+srv://ayaanali20:bbBjoSe9MyixNYJP@collabor8.tj1fc3p.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(
  db,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  (error) => {
    if (error) console.log(error);
  }
);

//...
const passport = require("passport");

require("./src/config/google");

//...

app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/profile",
    failureFlash: true,
    successFlash: "Successfully logged in!",
  })
);

//...

require("./src/config/passport");
require("./src/config/google");

//...

const flash = require("express-flash");
const session = require("express-session");

app.use(
  session({
    secret: "secr3t",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.get("/local/signup", (req, res) => {
  res.render("local/signup.ejs");
});

app.get("/local/signin", (req, res) => {
  res.render("local/signin.ejs");
});

//...
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const UserService = require("./src/user");
//...

require("./src/config/passport");
require("./src/config/google");
require("./src/config/local");

app.post("/auth/local/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (password.length < 8) {
    req.flash(
      "error",
      "Account not created. Password must be 7+ characters long"
    );
    return res.redirect("/local/signup");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await UserService.addLocalUser({
      id: uuid.v4(),
      email,
      firstName: first_name,
      lastName: last_name,
      password: hashedPassword,
    });
  } catch (e) {
    req.flash(
      "error",
      "Error creating a new account. Try a different login method."
    );
    return res.redirect("/local/signup");
  }

  return res.redirect("/local/signin");
});

//...

require("./src/config/local");

app.post(
  "/auth/local/signin",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/local/signin",
    failureFlash: true,
  })
);

app.get("/auth/logout", (req, res) => {
  req.flash("success", "Successfully logged out");
  req.session.destroy(function () {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});
