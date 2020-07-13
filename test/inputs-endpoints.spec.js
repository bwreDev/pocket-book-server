const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Inputs Enpoints', function () {
  let db;

  const { testUsers, testInputs } = helpers.makeInputsFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/inputs', () => {
    context('Given no inputs', () => {
      beforeEach('insert users', () => {
        helpers.seedUsers(db, testUsers);
      });
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/inputs')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, []);
      });
    });

    context('Given has inputs', () => {
      beforeEach('insert inputs and users', () => {
        helpers.seedInputsTables(db, testInputs);
        helpers.seedUsers(db, testUsers);
      });
      it('responds with 200', () => {
        return supertest(app)
          .get('/api/inputs')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200);
      });
    });

    context('Given an XSS attack input', () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousInput,
        expectedInput,
      } = helpers.makeMaliciousInput(testUser);

      beforeEach('insert malicious input', () => {
        return helpers.seedMaliciousInput(
          db,
          testUser,
          maliciousInput
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/inputs')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect((res) => {
            expect(res.body[0].title).to.eql(expectedInput.title);
            expect(res.body[0].amount).to.eql(expectedInput.amount);
            expect(res.body[0].content).to.eql(expectedInput.content);
          });
      });
    });
  });

  describe('POST /api/inputs', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers);
    });

    it('creates an input, responding with 201 and the new input', function () {
      const testUser = testUsers[0];
      const newInput = {
        title: 'income',
        amount: 200.0,
        content: 'Paycheck',
        user_id: testUser.id,
        date_added: new Date('2029-01-22T16:28:32.615Z'),
      };
      return supertest(app)
        .post('/api/inputs')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newInput)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property('id');
          expect(res.body.title).to.eql(newInput.title);
          expect(res.body.user_id).to.eql(newInput.user_id);
        });
    });
  });
});
