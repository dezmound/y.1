const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const pagesRoutes = require('./pages/routes');
const graphqlRoutes = require('./graphql/routes');
const { createData } = require('./create-mock-data');

const app = express();

app.use(bodyParser.json());

app.use('/', pagesRoutes);
app.use('/graphql', graphqlRoutes);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Используется в тестах, для сброса данных в базе.
 */
app.get('/reset', async function (req, res) {
   await global.sequelize.sync({force: true}).then(createData);
   res.status(200).send('db reset');
});

app.listen(3000, () => console.log('Express app listening on localhost:3000'));
