let express = require('express'),
    viewEngine = require('express-react-views'),
    logger = require("applicationinsights"),
    indexRouter = require('./routes'),
    app = express(),
    appInsightsKey = process.env.APPLICATION_INSIGHTS_KEY,
    port = process.env.PORT ? process.env.PORT : 4000;

// Setup Express to use React view engine
app.set('views', __dirname + '/client/build');
app.set('view engine', 'jsx');
app.engine('jsx', viewEngine.createEngine());

// Setup Application Insights
if (appInsightsKey !== null && appInsightsKey !== undefined ) {
logger.setup( process.env.APPLICATION_INSIGHTS_KEY )
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .start();
}

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(request, response, next) {
  error.status = 404;
  response.send({
    success: false,
    value: 'Resource Not Found'
  });
});

// error handler
app.use(function(error, request, response, next) {
  // set locals, only providing error in development
  response.locals.message = error.message;
  response.locals.error = request.app.get('env') === 'development' ? error : {};

  // render the error page
  response.status(error.status || 500);
  response.send({
    success: false,
    value: 'Internal Server Error'
  });
});

app.listen( port, () => console.log( `Express server listening on port ${port}` ) );

module.exports = app;
