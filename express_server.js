var express = require("express");
var cookiesession = require('cookie-session')
var app = express();
//var cookieparser = require('cookie-parser')
//app.use(cookieparser());
//app.keys = ['userid'];
app.use(cookiesession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000
}))

var PORT = 8080;
app.set("view engine", "ejs");
 const bcrypt = require('bcrypt');

var urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userid: 'userRandomID'},
  "9sm5xK": {longURL:"http://www.google.com", userid: 'user2RandomID'}
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
var perdata = {}
// new module
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').substr(0, 6);
}

function lookupemail(Nemail) {
  for(keys in users) {
    if(users[keys].email === Nemail) {
      return true
   }
  }
  return false
};

function retidfremail(Nemail) {
  for(keys in users) {
  if(users[keys].email === Nemail) {
    return users[keys].id
    }
  }
  return false
};
app.get("/register", (req, res) => {
  let templateVars = {
    Uobject: users[req.session.user_id]
  };
  res.render('urls_register', templateVars)
});

app.post('/register', (req,res) => {
  let templateVars = {
    Uobject: users[req.session.user_id],
  };
  const password = req.body.password; 
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (lookupemail(req.body.email)) {
    res.status(400);
    res.send('exsisting user');
   
  }
  else if (req.body.email && req.body.password) {
    let randid = generateRandomString()
      users[randid] = {
        id : randid,
        email : req.body.email,
        password : hashedPassword
      };
    req.session.user_id = randid;
    res.redirect('/urls')
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

app.get("/login", (req, res) => {
  let templateVars = {
    Uobject: users[req.session.user_id]
  };
  res.render('urls_login', templateVars)
});

app.post("/login", (req, res) => {
  if(!lookupemail(req.body.email)) {
    res.status(400);
    res.send('non exsistant email')
  }
  else if(bcrypt.compareSync(req.body.password, users[retidfremail(req.body.email)].password)) {
     req.session.user_id = retidfremail(req.body.email)
    res.redirect('/urls')
  }
  else {
    res.redirect('/login')
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect("/urls/")
});

app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    Uobject: users[req.session.user_id],
  };
  res.render('urls_home', templateVars)
});

app.get("/urls", (req, res) => {
  let cook = req.session.user_id
  const userUrls = {};
  for(let key in urlDatabase) {
    if(urlDatabase[key].userid === cook) {
      userUrls[key] = urlDatabase[key];
    }
  }
  let templateVars = {
    urls: userUrls,
    Uobject: users[req.session.user_id]
  };
  if(cook) {
    res.render('urls_index', templateVars)
  } else {
    res.redirect('/login')
  }
});

app.post("/urls", (req, res) => {
  let rand = generateRandomString()
  let cook = req.session.user_id
  urlDatabase[rand] = {
    longURL: req.body.longURL,
    userid: cook
  }
  res.redirect(`/urls/${rand}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let cook = req.session.user_id
  if (urlDatabase[req.params.shortURL].userid === cook) {
    delete urlDatabase[req.params.shortURL]
    res.redirect('/urls');
  }
  else {
    res.status(418)
    res.send('not aloud access')
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    Uobject: users[req.session.user_id]
  };
  if(req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL1 = perdata[req.params.shortURL].longURL
  res.redirect(longURL1);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    URLs: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    Uobject: users[req.session.user_id]
  };
  if(req.session.user_id) {
      if(req.session.user_id === urlDatabase[req.params.shortURL].userid) {
        res.render("urls_show", templateVars)
      } else {
        res.send('thats not your link')
      }
  } else {
      res.redirect('/login')
    }
});

app.post("/urls/:shortURL/update", (req, res) => {
  let cook = req.session.user_id
  if (urlDatabase[req.params.shortURL].userid === cook) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL
    res.redirect("/urls/" + req.params.shortURL)
  } else {
    res.status(418)
    res.send('not aloud acces')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});