var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser())
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
// new module
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').substr(0, 6);
}
function lookupemail(Nemail) {
  console.log(Nemail)
  console.log(users)
  for(keys in users) {
  if(users[keys].email === Nemail) {
    return true
    console.log('the email exsists')
  }

}
return false
}

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render('urls_register', templateVars)
});

app.post('/register', (req,res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  if (lookupemail(req.body.email)) {
  res.status(400);
  res.send('Error 400 exsisting user');
}
  else if (req.body.email && req.body.password) {
  let randid = generateRandomString()
  users[randid] = {
    id : randid,
    email : req.body.email,
    password : req.body.password};
  //users[randid] = randid
 // users.id = randid
  //users[randid].email = req.body.email
 // users[randid].passwords = req.body.password
  res.cookie('user_id', randid)
  res.redirect('/urls')
  console.log(users)
  console.log(lookupemail(req.body.email))
}
else if(!req.body.email || !req.body.password){
  res.status(400);
  res.send('Error 400 empty fields');
}
else {
 res.status(400);
  res.send('unexpected error');
}

})


// create a post to /login to set a cookie
// named username to the vlaue from the request body
//after cookie hasd bein set redirect to /urls
app.post("/login", (req, res) => {

res.cookie('username', req.body.username)
res.redirect("/urls/")
});

app.post("/logout", (req, res) => {

res.clearCookie('username')
res.redirect("/urls/")
});

app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render('urls_home', templateVars)
});





/*app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); */

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars)
});

// edit the post so shortURL-longURL key-value pair are saved to the urlDatabase

app.post("/urls", (req, res) => {
  let rand = generateRandomString()
  urlDatabase[rand] = req.body.longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${rand}`);         // Respond with 'Ok' (we will replace this)
});


app.post("/urls/:sid/delete", (req, res) => {
  delete urlDatabase[req.params.sid]
  res.redirect('/urls');
});





// new one
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});



app.get("/u/:shortURL", (req, res) => {
  const longURL1 = urlDatabase[req.params.shortURL]

  res.redirect(longURL1);
});



app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
   shortURL: req.params.shortURL,
  longURL: urlDatabase[req.params.shortURL],
  username: req.cookies["username"] };
  res.render("urls_show", templateVars);

});



app.post("/urls/:shortURL/update", (req, res) => {
// take in form answer
// replace value for provided key
let a = req.params.shortURL
urlDatabase[req.params.shortURL] = req.body.newURL
// redirect back to form
console.log(urlDatabase)
res.redirect("/urls/" + req.params.shortURL)
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});