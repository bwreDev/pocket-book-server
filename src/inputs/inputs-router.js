const path = require('path');
const express = require('express');
const xss = require('xss');
const InputsService = require('./inputs-service');
const { requireAuth } = require('../middleware/jwt-auth');

const inputsRouter = express.Router();
const jsonParser = express.json();

const serializeInput = (input) => ({
  id: input.id,
  title: input.title,
  amount: input.amount,
  content: xss(input.content),
  date_added: input.date_added,
  user_id: input.user_id,
});

inputsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    InputsService.getAllInputs(knexInstance, req.user.id)
      .then((inputs) => {
        res.json(inputs.map(serializeInput));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, amount, content, date_added } = req.body;
    const newInput = { title, amount, content };

    for (const [key, value] of Object.entries(newInput))
      if (value == null)
        return res.status(400).json({
          error: {
            message: `Missing '${key}' in request body`,
          },
        });
    newInput.user_id = req.user.id;
    newInput.date_added = date_added;

    InputsService.insertInput(req.app.get('db'), newInput)
      .then((input) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${input.id}`))
          .json(serializeInput(input));
      })
      .catch(next);
  });

inputsRouter
  .route('/:input_id')
  .all(requireAuth)
  .all((req, res, next) => {
    InputsService.getById(req.app.get('db'), req.params.input_id)
      .then((input) => {
        if (!input) {
          return res.status(404).json({
            error: {
              message: 'Input does not exist',
            },
          });
        }
        res.input = input;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeInput(res.input));
  })
  .delete((req, res, next) => {
    InputsService.deleteInput(req.app.get('db'), req.params.input_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = inputsRouter;
