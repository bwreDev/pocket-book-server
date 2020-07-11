const path = require('path');
const express = require('express');
const xss = require('xss');
const InputsService = require('./inputs-service');
const { requireAuth } = require('../middleware/jwt-auth');

const inputsRouter = express.Router();
const jsonParser = express.json();

const serializeEvent = (input) => ({
  id: input.id,
  title: input.title,
  amount: xss(input.amount),
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
        res.json(inputs.map(serializeEvent));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, amount, date_added } = req.body;
    const newEvent = { title, amount };

    for (const [key, value] of Object.entries(newEvent))
      if (value == null)
        return res.status(400).json({
          error: {
            message: `Missing '${key}' in request body`,
          },
        });
    newEvent.user_id = req.user.id;
    newEvent.date_added = date_added;

    InputsService.insertEvent(req.app.get('db'), newEvent)
      .then((input) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${input.id}`))
          .json(serializeEvent(input));
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
              message: 'Event does not exist',
            },
          });
        }
        res.input = input;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeEvent(res.input));
  })
  .delete((req, res, next) => {
    InputsService.deleteEvent(req.app.get('db'), req.params.input_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { amount } = req.body;
    const inputToUpdate = {
      amount,
    };

    const numberOfValues = Object.values(inputToUpdate).filter(
      Boolean
    ).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'amount'.`,
        },
      });

    InputsService.updateEvent(
      req.app.get('db'),
      req.params.input_id,
      inputToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = inputsRouter;
