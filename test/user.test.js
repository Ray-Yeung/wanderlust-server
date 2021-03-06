'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { dbConnect, dbDisconnect } = require('../db-mongoose');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config'); ('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);



describe('Best Coast API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstname = 'firstname';
  const lastname = 'lastname';

  /* ========== TESTING HOOKS ========== */

  before(function () {
    console.log('hi');
    return dbConnect(TEST_DATABASE_URL);
  });

  beforeEach(function () { });

  afterEach(function () {
    return User.remove();
  });

  after(function () {
    return dbDisconnect();
  });

  // before(function () {
  //   return mongoose.connect(TEST_MONGODB_URL)
  //     .then(() => mongoose.connection.db.dropDatabase());
  // });

  // beforeEach(function () {
  //   return User.ensureIndexes();
  // });

  // afterEach(function () {
  //   return User.remove();
  //   // return User.collection.drop();
  //   // return mongoose.connection.db.dropDatabase()
  // });

  // after(function () {
  //   return mongoose.disconnect();
  // });

  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user with valid password', function () {
        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password, firstname, lastname })
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'firstname', 'lastname');
            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(username);
            expect(res.body.firstname).to.equal(firstname);
            expect(res.body.lastname).to.equal(lastname);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.firstname).to.equal(firstname);
            expect(user.lastname).to.equal(lastname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });

      it('Should reject users with missing username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ password, firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing field');
          });
      });

      it('Should reject users with missing password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            console.log(res);
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing field');
          });

      });

      it('Should reject users with non-string username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username: 1234, password, firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Incorrect input: expected string');
          });
      });
      //do we really want this?
      it('Should reject users with non-string password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password: 1234, firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Incorrect input: expected string');
          });
      });

      it('Should reject users with non-trimmed username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username: ` ${username} `, password, firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
          });
      });

      it('Should reject users with non-trimmed password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password: ` ${password}`, firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
          });
      });

      it('Should reject users with empty username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username: '', password, firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            // expect(res.body.message).to.equal('Field: \'username\' must be at least 1 characters long');
          });
      });

      it('Should reject users with password less than 8 characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password: 'asdfghj', firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            // expect(res.body.message).to.equal('Field: \'password\' must be at least 8 characters long');
          });
      });

      it('Should reject users with password greater than 72 characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password: new Array(73).fill('a').join(''), firstname, lastname })
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            // expect(res.body.message).to.equal('Field: \'password\' must be at most 72 characters long');
          });
      });

      // it('Should reject users with duplicate username', function () {
      //   return User
      //     .create({
      //       username,
      //       password,
      //       firstname,
      //       lastname
      //     })
      //     .then(() => {
      //       return chai
      //         .request(app)
      //         .post('/api/users')
      //         .send({ username, password, firstname, lastname });
      //     })
      //     .catch(err => err.response)
      //     .then(res => {
      //       expect(res).to.have.status(400);
      //       // expect(res.body.message).to.equal('The username already exists');
      //     });
      // });

      it('Should trim firstname', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password, firstname: ` ${firstname} ` })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('username', 'firstname', 'lastname', 'id');
            expect(res.body.username).to.equal(username);
            expect(res.body.firstname).to.equal(firstname);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstname).to.equal(firstname);
          });
      });
    });
  });
});