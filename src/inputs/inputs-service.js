const InputsService = {
  getAllInputs(knex, user_id) {
    return knex.from('inputs').select('*').where('user_id', user_id);
  },
  getById(knex, id) {
    return knex
      .from('inputs')
      .select('*')
      .leftJoin('users AS user', 'inputs.user_id', 'user.id')
      .where('inputs.id', id)
      .first();
  },
  insertInput(knex, newInput) {
    return knex
      .insert(newInput)
      .into('inputs')
      .returning('*')
      .then(([input]) => input)
      .then((input) => InputsService.getById(knex, input.id));
  },
  deleteInput(knex, id) {
    return knex.from('inputs').where({ id }).delete();
  },
};

module.exports = InputsService;
