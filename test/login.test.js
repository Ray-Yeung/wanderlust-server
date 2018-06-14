'use strict';

const {app} = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const { dbConnect, dbDisconnect } = require('../db-mongoose');

const User = require('../models/user');

// const seedUsers = require('../seed/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe.only('Tests for Best Coast login API', function() {
  let token;
  const firstname = 'Examplefirst';
  const lastname = 'Examplelast';
  const username = 'exampleUser';
  const password = 'examplePass';
  const _id = '333333333333333333333300';

  before(function () {
    return dbConnect(TEST_DATABASE_URL);
    // return mongoose.connect(TEST_MONGODB_URI)
    //   .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.hashPassword(password)
      .then(digest => {
        return User.create({
          username,
          password: digest,
          firstname,
          lastname,
          _id
          // toObject: {
          //   transform: function (doc, ret) {
          //     ret.id = ret._id;
          //   }
          // }
          
        });
      });
  });


  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return dbDisconnect();
  });

  describe('Best Coast /login', function() {
    it('Should return a valid token', function () {
      return chai.request(app).post('/api/login').send({username, password})
        .then(res => {
          console.log(res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.authToken).to.be.a('string');
          const payload = jwt.verify(res.body.authToken, JWT_SECRET);
          console.log(payload);
          expect(payload.user).to.not.have.property('password');
          expect(payload.user).to.have.keys( 'id', 'username', 'firstname', 'lastname');
          expect(payload.user.username).to.equal(username);
          expect(payload.user.firstname).to.equal(firstname);
          expect(payload.user.lastname).to.equal(lastname);
          expect(payload.user.id).to.deep.equal(_id);
          expect(payload.user).to.deep.equal({ id: _id, username, firstname, lastname });
        });  
    });

    // it.only('Should reject requests with no credentials', function() {
    //   return chai.request(app).post('/api/login').send({})
    //     .catch(err => err.respone)
    //     .then(res => {
    //       // expect(res).to.have.status(400);
    //       expect(res.body).to.be.an('object');
    //       expect(res.body.message).to.eq('Bad Request');
    //       expect(res.body).to.have.keys('message', 'error');
    //     });  
    // });

    // it('Should reject requests with incorrect usernames', function() {
    //   return chai.request(app).post('/api/login').send({username: 'blahblahblah', password})
    //     .catch(err => err.respone)
    //     .then(res => {
    //       // expect(res).to.have.status(401);
    //       expect(res.body).to.be.an('object');
    //       expect(res.body.message).to.eq('Unauthorized');
    //       expect(res.body).to.have.keys('message', 'error');
    //     });  
    // });

    // it('Should reject requests with incorrect passwords', function() {
    //   return chai.request(app).post('/api/login').send({username, password: 'blahblahblah'})
    //     .catch(err => err.respone)
    //     .then(res => {
    //       // expect(res).to.have.status(401);
    //       expect(res.body).to.be.an('object');
    //       expect(res.body.message).to.eq('Unauthorized');
    //       expect(res.body).to.have.keys('message', 'error');
    //     });  
    // });
  });
});