const { request } = require('graphql-request');
const chai = require('chai');
const chai_as_promised = require('chai-as-promised');
const util = require('util');
const request_http = util.promisify(require('request'));
chai.use(chai_as_promised);
chai.should();

beforeEach('clear db', async function () {
    await request_http('http://localhost:3000/reset');
    await new Promise(function (resolve) {
        setTimeout(resolve, 50);
    });
});

describe('GraphQl', function () {
   context('Users', function () {
       it('should return users from db', function () {
           return request('http://localhost:3000/graphql', `
                {
                    users {
                        id
                    }
                }
           `).should.eventually.have.property('users').with.lengthOf(3);
       });
       it('should return user with id equal 1 and not empty avatarUrl and homeFloor property', function () {
           let promise = request('http://localhost:3000/graphql', `
                {
                    user(id: 1) {
                        id,
                        avatarUrl,
                        homeFloor
                    }
                }
           `);
           return Promise.all([
               promise.should.eventually.have.property('user').with.property('id').equal('1'),
               promise.should.eventually.have.property('user').with.property('avatarUrl'),
               promise.should.eventually.have.property('user').with.property('homeFloor')
           ]);
       });
       it('should create a test user', function () {
           let promise = request('http://localhost:3000/graphql', `
           mutation {
                    createUser(input: {
                        login: "test",
                        homeFloor: 1
                    }) {
                        login,
                        homeFloor
                    }
            }
           `);
           return Promise.all([
               promise.should.eventually.have.property('createUser').with.property('login', 'test'),
               promise.should.eventually.have.property('createUser').with.property('homeFloor', 1)
           ])
       });
       it('should remove a user with id=1', function () {
           let promise = request('http://localhost:3000/graphql', `
           mutation {
                    removeUser(id: 1) {
                        id
                    }
            }
           `);
           return Promise.all([
               promise.should.eventually.have.property('removeUser').with.property('id', '1')
           ])
       });
   });
   context('Rooms', function () {
       it('should return rooms from db', function () {
           return request('http://localhost:3000/graphql', `
                {
                    rooms {
                        id
                    }
                }
           `).should.eventually.have.property('rooms').with.lengthOf(5);
       });
       it('should return room with id equal 1', function () {
           let promise = request('http://localhost:3000/graphql', `
                {
                    room(id: 1) {
                        id,
                        title,
                        capacity,
                        floor
                    }
                }
           `);
           return Promise.all([
               promise.should.eventually.have.property('room').with.property('id').equal('1'),
               promise.should.eventually.have.property('room').with.property('title'),
               promise.should.eventually.have.property('room').with.property('capacity'),
               promise.should.eventually.have.property('room').with.property('floor')
           ]);
       });
       it('should create a test room', function () {
           let promise = request('http://localhost:3000/graphql', `
           mutation {
                    createRoom(input: {
                        title: "test",
                        capacity: 1
                        floor: 1
                    }) {
                        title,
                        capacity,
                        floor
                    }
            }
           `);
           return Promise.all([
               promise.should.eventually.have.property('createRoom').with.property('title'),
               promise.should.eventually.have.property('createRoom').with.property('capacity'),
               promise.should.eventually.have.property('createRoom').with.property('floor')
           ])
       });
       it('should remove a room with id=1', function () {
           let promise = request('http://localhost:3000/graphql', `
           mutation {
                    removeRoom(id: 1) {
                        id
                    }
            }
           `);
           return Promise.all([
               promise.should.eventually.have.property('removeRoom').with.property('id', '1')
           ])
       });
   });
   context('Events', function () {
       it('should return events from db', function () {
           return request('http://localhost:3000/graphql', `
                {
                    events {
                        id
                    }
                }
           `).should.eventually.have.property('events').with.lengthOf(3);
       });
       it('should return events with id equal 2', function () {
           let promise = request('http://localhost:3000/graphql', `
                {
                    event(id: 2) {
                        id,
                        title,
                        dateStart,
                        dateEnd,
                        users {
                            id
                        }
                        room {
                            id
                        }
                    }
                }
           `);
           return Promise.all([
               promise.should.eventually.have.property('event').with.property('id').equal('2'),
               promise.should.eventually.have.property('event').with.property('title'),
               promise.should.eventually.have.property('event').with.property('dateStart'),
               promise.should.eventually.have.property('event').with.property('users').lengthOf(2),
               promise.should.eventually.have.property('event').with.property('room').with.property('id')
           ]);
       });
       it('should create a test event', function () {
           let promise = request('http://localhost:3000/graphql', `
           mutation {
                    createEvent(input: {
                        title: "test",
                        dateStart: "2018-01-02T20:01:32.322Z"
                        dateEnd: "2018-01-02T20:01:32.322Z"
                    }, usersIds: [1,2], roomId: 1) {
                        title,
                        dateStart,
                        dateEnd,
                        users {
                            id
                        }
                        room {
                            id
                        }
                    }
            }
           `);
           return Promise.all([
               promise.should.eventually.have.property('createEvent').with.property('title'),
               promise.should.eventually.have.property('createEvent').with.property('dateStart'),
               promise.should.eventually.have.property('createEvent').with.property('users').lengthOf(2),
               promise.should.eventually.have.property('createEvent').with.property('room').with.property('id')
           ])
       });
       it('should remove a event with id=1', function () {
           let promise = request('http://localhost:3000/graphql', `
           mutation {
                    removeEvent(id: 1) {
                        id
                    }
            }
           `);
           return Promise.all([
               promise.should.eventually.have.property('removeEvent').with.property('id', '1')
           ])
       });
       it('should remove user from event with id=1', function () {
           let promise = request('http://localhost:3000/graphql', `
           mutation {
                    removeUserFromEvent(id: 1, userId: 1) {
                        id
                    }
            }
           `);
           let promise_users = request('http://localhost:3000/graphql', `
           {
                    event(id: 1) {
                        users {
                            id
                        }
                    }
            }
           `);
           return Promise.all([
               promise.should.eventually.have.property('removeUserFromEvent').with.property('id', '1'),
               promise_users.should.eventually.have.property('event').with.property('users').lengthOf(1)
           ]);
       });
       it('should add user to event with id=1', async function () {
           let promise = await request('http://localhost:3000/graphql', `
           mutation {
                    addUserToEvent(id: 1, userId: 3) {
                        id
                    }
            }
           `);
           let promise_users = request('http://localhost:3000/graphql', `
           {
                    event(id: 1) {
                        users {
                            id
                        }
                    }
            }
           `);
           return Promise.all([
               promise.should.have.property('addUserToEvent').with.property('id', '1'),
               promise_users.should.eventually.have.property('event').with.property('users').lengthOf(3)
           ]);
       });

       it('should change room in event with id=1', function () {
           let promise = request('http://localhost:3000/graphql', `
           mutation {
                    changeEventRoom(id: 1, roomId: 2) {
                        id,
                        room {
                            id
                        }
                    }
            }
           `);
           return Promise.all([
               promise.should.eventually.have.property('changeEventRoom').with.property('id', '1'),
               promise.should.eventually.have.property('changeEventRoom').with.property('room').with.property('id', '2'),
           ]);
       });
   });
});