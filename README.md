1. При старте приложения получаем exception:
`throw new Error('Dialect needs to be explicitly supplied as of v4.0.0');`  
Открыв исходник sequielze, понимаем, что в файле `models/index.js` не хватает параметра `password`.  
Заменяем:
```javascript 
const sequelize = new Sequelize(null, null, {
  dialect: 'sqlite',
  storage: 'db.sqlite3',

operatorsAliases: { $and: Op.and },

  logging: false
});
```
на:
```javascript
const sequelize = new Sequelize(null, null, null, {
  dialect: 'sqlite',
  storage: 'db.sqlite3',

operatorsAliases: { $and: Op.and },

  logging: false
});
```
2. После запуска пробеум открыть страницу [http://localhost:3000/graphql/](http://localhost:3000/graphql/).  
Получаем сообщение:
`Cannot GET /graphql/`  
Проанализировав маршруты в файле `index.js` видим что в строке:  
`app.use('/graphgl', graphqlRoutes);` допущена опечатка, исправляем `app.use('/graphql', graphqlRoutes);`.  
 3. В UI пытаемся получить список событий в системе, используя запрос вида:  
```
 {
   events {
     id
   }
 }
```
 Получаем следующее сообщение об ошибке:
```JSON
 {
   "errors": [
     {
       "message": "argumets is not defined",
       "locations": [
         {
           "line": 39,
           "column": 3
         }
       ],
       "path": [
         "events"
       ]
     }
   ],
   "data": {
     "events": null
   }
 }
```
 Исправляем код в файле `graphql/resolvers/query.js`:
```javascript
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
```
4. Пытаемся получить список пользователей, учавствующих в событии с id=1:
~~~
{
  event(id: 1) {
    id,
    users {
      id
    }
  }
}
~~~
Вместо ожидаемого списка пользователей, возвращается `null`:
```JSON
{
  "data": {
    "event": {
      "id": "1",
      "users": null
    }
  }
}
```
Убедившись, что в базе существуют пользователи, относяющися к этому событию исправляем имя промежуточной таблицы в файле `models/scheme.js`:
```javascript
Event.belongsToMany(User, { through: 'events_users' });
User.belongsToMany(Event, { through: 'events_users' });
```
Не получив ожидаемого результата, видим, что в `graphql/resolvers/index.js` для `Event` в методах `users` и `room` не хватает `return`:
```ecmascript 6
Event: {
      users (event) {
        event.getUsers();
      },
      room (event) {
        event.getRoom();
      }
    }
```
5. В файле `graphql/resolvers/mutaion.js` исправляем ошибку в функции `changeEventRoom`:
```ecmascript 6
changeEventRoom (root, { id, roomId }, context) {
    return models.Event.findById(id)
            .then(event => {
              event.setRoom(
                  id // --> roomId
                  );
              return event;
            });
  }
```
6. При добавлении пользователя к событию `addUserToEvent`, получаем ответ следуещего вида:
```JSON
{
  "data": {
    "addUserToEvent": null
  }
}
```
В файле `graphql/resolvers/mutation.js` не хватает метода `addUserToEvent`.
```ecmascript 6
addUserToEvent (root, { id, userId }, context) {
    return models.Event.findById(id)
            .then(event => {
              event.addUser(userId);
              return event;
            });
  }
```
