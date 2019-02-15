var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser())
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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
    console.log('the email exsists')
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

// start of endpoint

// add

app.get("/register", (req, res) => {
  let templateVars = {

    Uobject: users[req.cookies["user_id"]]
  };
  res.render('urls_register', templateVars)
});

app.post('/register', (req,res) => {
  let templateVars = {
    Uobject: users[req.cookies["user_id"]]
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

app.get("/login", (req, res) => {
  let templateVars = {

    Uobject: users[req.cookies["user_id"]]
  };
  res.render('urls_login', templateVars)
});




app.post("/login", (req, res) => {
  // look up email
  if(!lookupemail(req.body.email)) {
    //if email cant be found send 403
    res.status(400);
    res.send('non exsistant email')
  }
  //works
  else if(users[retidfremail(req.body.email)].password !== req.body.password) {
    res.status(400);
    res.send('wrong password')
  }
  else {
    res.cookie('user_id', retidfremail(req.body.email))
    res.redirect('/urls')
  }
  //if email is found compare the password if it doenst match send 403
  // if both pass set cookie and redirect to url

});

app.post("/logout", (req, res) => {

res.clearCookie('user_id')
res.redirect("/urls/")
});

app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    Uobject: users[req.cookies["user_id"]],
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
  let cook = req.cookies.user_id


  for(let key in urlDatabase) {
    if(urlDatabase[key].userid === cook) {
      perdata[key] = urlDatabase[key];

    }
}
console.log(perdata)
  let templateVars = {
    urls: perdata,
    Uobject: users[req.cookies["user_id"]]
  };

  if(cook) {

    res.render('urls_index', templateVars)
  } else {
    res.redirect('/login')
  }
});

// edit the post so shortURL-longURL key-value pair are saved to the urlDatabase

app.post("/urls", (req, res) => {
  let rand = generateRandomString()
  let cook = req.cookies.user_id
  urlDatabase[rand] = {
    longURL: req.body.longURL,
    userid: cook
}
//console.log()
//  urlDatabase[rand] = req.body.longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${rand}`);         // Respond with 'Ok' (we will replace this)
});


app.post("/urls/:sid/delete", (req, res) => {
  let cook = req.cookies.user_id
  if (urlDatabase[req.params.sid].userid === cook) {
  delete urlDatabase[req.params.sid]
  res.redirect('/urls');}
  else {
    res.status(418)
    res.send('you dirty bird')
  }

});





// new one
app.get("/urls/new", (req, res) => {
  let templateVars = {
    Uobject: users[req.cookies["user_id"]]
  };
  if(req.cookies["user_id"]) {
  res.render("urls_new", templateVars);
} else {
  res.redirect('/login')
}
});



app.get("/u/:shortURL", (req, res) => {
  const longURL1 = urlDatabase[req.params.shortURL]

  res.redirect(longURL1);
});



app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
   shortURL: req.params.shortURL,
  longURL: urlDatabase[req.params.shortURL].longURL,
  Uobject: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);

});



app.post("/urls/:shortURL/update", (req, res) => {
// take in form answer
// replace value for provided key
let cook = req.cookies.user_id
  if (urlDatabase[req.params.shortURL].userid === cook) {
  urlDatabase[req.params.shortURL] = req.body.newURL
console.log(urlDatabase)
res.redirect("/urls/" + req.params.shortURL)
}
  else {
    res.status(418)
    res.send('you dirty bird')
  }
})







app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});