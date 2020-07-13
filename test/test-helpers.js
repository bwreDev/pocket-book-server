const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      first_name: 'Test user 1',
      last_name: 'TU1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      username: 'test-user-2',
      first_name: 'Test user 2',
      last_name: 'TU2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      username: 'test-user-3',
      first_name: 'Test user 3',
      last_name: 'TU3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      username: 'test-user-4',
      first_name: 'Test user 4',
      last_name: 'TU4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeInputsArray(users) {
  return [
    {
      id: 1,
      title: 'income',
      user_id: users[0].id,
      date_added: new Date('2029-01-22T16:28:32.615Z'),
      amount: 400.0,
      content: 'Paycheck',
    },
    {
      id: 2,
      title: 'debt',
      user_id: users[1].id,
      date_added: new Date('2029-01-22T16:28:32.615Z'),
      amount: 250.25,
      content: 'Rent',
    },
    {
      id: 3,
      title: 'income',
      user_id: users[2].id,
      date_added: new Date('2029-01-22T16:28:32.615Z'),
      amount: 125.17,
      content: 'Paycheck',
    },
    {
      id: 4,
      title: 'debt',
      user_id: users[3].id,
      date_added: new Date('2029-01-22T16:28:32.615Z'),
      amount: 117.12,
      content: 'Groceries',
    },
  ];
}

function makeExpectedInput(users, input = []) {
  const user = users.find((user) => user.id === input.user_id);

  return {
    id: input.id,
    title: input.title,
    amount: input.amount,
    content: input.content,
    date_added: input.date_added.toISOString(),
    user: {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      date_created: user.date_created.toISOString(),
    },
  };
}

function makeMaliciousInput(user) {
  const maliciousInput = {
    id: 911,
    date_added: new Date(),
    title: 'income',
    user_id: user.id,
    amount: 250.34,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedInput = {
    ...makeExpectedInput([user], maliciousInput),
    title: 'income',
    amount: '250.34',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousInput,
    expectedInput,
  };
}

function makeInputsFixtures() {
  const testUsers = makeUsersArray();
  const testInputs = makeInputsArray(testUsers);
  return { testUsers, testInputs };
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
        inputs,
        users
      `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE inputs_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(
            `ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`SELECT setval('inputs_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [
        users[users.length - 1].id,
      ])
    );
}

function seedInputsTables(db, users, inputs = []) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into('inputs').insert(inputs);

    await trx.raw(`SELECT setval('inputs_id_seq', ?)`, [
      inputs[inputs.length - 1].id,
    ]);
  });
}

function seedMaliciousInput(db, user, input) {
  return seedUsers(db, [user]).then(() =>
    db.into('inputs').insert([input])
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeInputsArray,
  makeExpectedInput,
  makeMaliciousInput,
  makeInputsFixtures,
  cleanTables,
  seedInputsTables,
  seedMaliciousInput,
  makeAuthHeader,
  seedUsers,
};
