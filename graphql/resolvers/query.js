const { models } = require('../../models');

module.exports = {
event (root, { id }) {
    return models.Event.findById(id);
  },
  events (root, args, context) {
    return models.Event.findAll(args, context);
  },
user (root, { id }) {
    return models.User.findById(id);
  },
  users (root, args, context) {
    return models.User.findAll(args, context);
  },
room (root, { id }) {
    return models.Room.findById(id);
  },
  rooms (root, args, context) {
    return models.Room.findAll(args, context);
  }
};
