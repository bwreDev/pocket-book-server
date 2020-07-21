## Pocket Book Server

This is the Express server API for my app Pocket Book.
Client can be found here [pocket-book-client](https://github.com/cbonner26118/pocket-book-client)
Live app can be found here [https://pocket-book-client.vercel.app/](https://pocket-book-client.vercel.app/)

## API Overview

```
/api
.
├── /auth
│   └── POST
│       ├── /login
│       └── /refresh
├── /users
│   └── POST
│       └── /
├── /inputs
│   └── GET
│       ├── /
│       ├── /:input_id/
│   └── POST
│       ├── /
│   └── DELETE
|       ├── /:input_id/
```

## POST `/api/auth/login

```
//req.body
{
    username: "String",
    password: "String"
}

//res.body
{
    authToken: "String"
}
```

## POST `/api/auth/refresh`

```
//req.header
Authorization: Bearer ${token}

//res.body
{
    authToken: ${token}
}
```

## POST /api/users

```
//req.body
{
    first_name: "String",
    last_name: "String",
    username: "String",
    password: "String"
}
```

## GET `/api/inputs`

```
//res.body
[
    {
        id: Number,
        title: "String",
        amount: "String",
        content: "String",
        date_added: "String",
        user_id: Number
    }
]
```

## POST `/api/inputs`

```
//req.body
{
    title: "String",
    content: "String",
    amount: "String"
}
//res.body
{
    id: Number,
    title: "String",
    amount: "String",
    content: "String",
    date_added: "String",
    user_id: Number
}
```

## DELETE `/api/inputs/:input_id`

```
//req.header
Authorization: Bearer ${token}
```

## Tech

This back end is built using Node.js, Express, and PostgreSQL

# Built using my Express Boilerplate!

This is a [boilerplate](https://github.com/cbonner26118/express-boilerplate) project used for starting new projects!

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Migrate SQL server scripts `npm run migrate`

Migrate test SQL server scripts `npm run migrate:test`

Migrate production SQL server scripts `npm run migrate:production`

Run an audit and migrate to production, then push to production on Heroku `npm run deploy`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
