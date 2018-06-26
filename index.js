'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

//require local and jwt strategies
const localStrategy = require('./auth/local-strategy');
const jwtStrategy = require('./auth/jwt');

//require auth routers
const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const placesRouter = require('./routes/places');
const tripsRouter = require('./routes/trips');
const commentsRouter = require('./routes/comments');

//set app as express()
const app = express();
app.use(express.json());

//call on passport for user authentication
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use('/api', userRouter);
app.use('/api', authRouter);
app.use('/api', placesRouter);
app.use('/api', tripsRouter);
app.use('/api', commentsRouter);

// Catch-all 404
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
