const express = require("express");
const nanoid = require("nanoid");
const validUrl = require("valid-url");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");
require("./db/mongoose");
const { UrlModel } = require("./models/urlModel");
const { UserModel } = require("./models/userModel");

const port = process.env.PORT || 3000;

const limiter = new RateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    expireTimeMs: 10000,
    errorHandler: console.error.bind(null, "rate-limit-mongo"),
  }),
  max: 30,
  windowMs: 2000,
});

const Url = UrlModel;
const User = UserModel;
const secret = process.env.SECRET;

const emailRegexp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(limiter);
app.set("view engine", "ejs");
app.set("views", "./src/views");

app.get("/", (req, res) => {
  if (req.cookies.user) {
    res.redirect("/dashboard");
  } else {
    res.render("pages/index");
  }
});

app.get("/login", (req, res) => {
  if (req.cookies.user) {
    res.redirect("/dashboard");
  } else {
    res.render("pages/login");
  }
});

app.get("/signup", (req, res) => {
  if (req.cookies.user) {
    res.redirect("/dashboard");
  } else {
    res.render("pages/signup");
  }
});

app.get("/dashboard", async (req, res) => {
  if (!req.cookies.user) {
    res.redirect("/login");
  } else {
    const token = req.cookies.user;
    const decoded = jwt.verify(token, secret);
    if (decoded) {
      const user = await User.findOne({
        email: decoded.email,
        "tokens.token": token,
      });
      if (!user) {
        res.clearCookie("user").redirect("/login");
      } else {
        res.render("pages/dashboard");
      }
    } else {
      res.clearCookie("user").redirect("/login");
    }
  }
});

app.post("/login", async (req, res) => {
  if (req.cookies.user) {
    res.redirect("/dashboard");
  } else {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email });
    if (user) {
      if (bcrypt.compareSync(password, user.passwordHash)) {
        const token = jwt.sign({ email }, secret);
        const tokens = user.tokens;
        tokens.push({ token });
        User.findOneAndUpdate(
          { email },
          { tokens },
          { useFindAndModify: false }
        )
          .then((_) => {
            res.cookie("user", token).redirect("/dashboard");
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        res.redirect("/login?error=Wrong");
      }
    } else {
      res.redirect("/login?error=Wrong");
    }
  }
});

app.post("/signup", async (req, res) => {
  if (req.cookies.user) {
    res.redirect("/dashboard");
  } else {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirm;

    if (!email) {
      res.redirect("/signup?error=Wrong");
    } else if (!password) {
      res.redirect("/signup?error=Wrong");
    } else if (password.length < 8) {
      res.redirect("/signup?error=Wrong");
    } else if (!confirmPassword) {
      res.redirect("/signup?error=Wrong");
    } else if (!emailRegexp.test(email)) {
      res.redirect("/signup?error=Wrong");
    } else {
      if (password !== confirmPassword) {
        res.redirect("/signup?error=Wrong");
      } else {
        const foundUser = await User.findOne({ email });
        if (foundUser) {
          res.redirect("/signup?error=Wrong");
        } else {
          const hash = bcrypt.hashSync(password, 10);
          const token = jwt.sign({ email }, secret);
          User({
            email,
            passwordHash: hash,
            proMember: false,
            emailVerified: false,
            tokens: [
              {
                token,
              },
            ],
          })
            .save()
            .then((_) => {
              res.cookie("user", token).redirect("/dashboard");
            })
            .catch((e) => {
              console.log(e);
            });
        }
      }
    }
  }
});

app.post("/logout", async (req, res) => {
  const token = req.cookies.user;
  if (!token) {
    res.redirect("/login");
  } else {
    const decoded = jwt.verify(token, secret);
    if (!decoded) {
      res.clearCookie("user").redirect("/login");
    } else {
      const user = await User.findOne({ email: decoded.email });
      const tokens = user.tokens;
      foundToken = false;
      actualToken = null;
      tokens.forEach((i) => {
        if (i.token === token) {
          foundToken = true;
          actualToken = i;
        }
      });
      const index = tokens.indexOf(actualToken);
      if (foundToken) {
        tokens.splice(index, 1);
      }
      User.findOneAndUpdate(
        { email: decoded.email },
        { tokens },
        { useFindAndModify: false }
      )
        .then((_) => {
          res.clearCookie("user").redirect("/");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
});

// Post request endpoint to get and store shortened URL
app.post("/shorten", (req, res) => {
  if (req.body.url) {
    if (validUrl.isUri(req.body.url)) {
      const uid = nanoid.nanoid(6);
      const url = "http://localhost:3000/" + uid;
      const newUrl = new Url({
        longUrl: req.body.url,
        shortUrl: url,
        userId: "00000",
        clicks: [],
      });
      newUrl
        .save()
        .then((_) => {
          res.send({
            originalURL: req.body.url,
            shortenedURL: url,
            code: 200,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.send({
        message: "Invalid URL",
        code: 400,
      });
    }
  } else {
    res.send({
      message: "Incorrect request",
      code: 400,
    });
  }
});

// Redirect endpoint (short to long url)
app.get("/:id", (req, res) => {
  Url.findOne(
    { shortUrl: "http://localhost:3000/" + req.params.id },
    (err, url) => {
      if (err) {
        res.send("Server error");
      } else if (!url) {
        res.send("Invalid URL");
      } else {
        let clicks = url.clicks;
        if (!clicks) {
          clicks = [];
        }
        clicks.push({ ip: req.ip, timestamp: new Date() });
        Url.findOneAndUpdate(
          { shortUrl: "http://localhost:3000/" + req.params.id },
          { clicks },
          { useFindAndModify: false },
          (err, _) => {
            if (err) {
              res.send("Server error");
            } else {
              res.redirect(url.longUrl);
            }
          }
        );
      }
    }
  );
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
