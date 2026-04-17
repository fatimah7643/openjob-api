const express = require('express');
const errorHandler = require('./middlewares/errorHandler');

const usersRouter = require('./routes/users');
const companiesRouter = require('./routes/companies');
const categoriesRouter = require('./routes/categories');
const jobsRouter = require('./routes/jobs');
const applicationsRouter = require('./routes/applications');
const bookmarksRouter = require('./routes/bookmarks');
const authenticationsRouter = require('./routes/authentications');
const profileRouter = require('./routes/profile');
const documentsRouter = require('./routes/documents');

const app = express();
app.use(express.json());

app.use('/users', usersRouter);
app.use('/companies', companiesRouter);
app.use('/categories', categoriesRouter);
app.use('/jobs', jobsRouter);
app.use('/applications', applicationsRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/authentications', authenticationsRouter);
app.use('/profile', profileRouter);
app.use('/documents', documentsRouter);


app.use(errorHandler);

module.exports = app;