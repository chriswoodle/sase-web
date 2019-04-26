import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as joi from 'joi';

const log = require('debug')('app:server');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan(':method :url :status - :response-time ms'));

app.use(cors());
// Enable json body parsing
app.use(bodyParser.json());

// Serve bundled Vue app
app.use(express.static(path.resolve(__dirname, '../../client/dist')));
app.use(express.static(path.resolve(__dirname, '../public')));

app.get('/', (req, res) => res.send('Hello World!'));

app.use('**', express.static(path.resolve(__dirname, '../../client/dist')));

app.listen(port, () => log(`Example app listening on port ${port}!`));
