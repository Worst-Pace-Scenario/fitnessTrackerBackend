const express = require('express');
const apiRouter = express.Router();

const jwt = require('jsonwebtoken');
const { getUserById, getUser } = require('../db');
const { JWT_SECRET } = process.env;
const password = "1025464"

apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  let auth = "";
    if(req.header("Authorization")){
        auth = req.header('Authorization');
    }
    if(req.header("authorization")){
        auth = req.header("authorization")
    }

  if (!auth) { 
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { username, password } = jwt.verify(token, JWT_SECRET);
    // const { id } = jwt.verify(token, password);

      if (username) {
        req.user = await getUser({username, password});
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`
    });
  }
});

apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
    }
  
    next();
  });

apiRouter.use((error, req, res, next) => {
    res.send({
      name: error.name,
      message: error.message
    });
  });


module.exports = apiRouter;