var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(request, response, next) {
  response.json([{
    id: 1,
    username: "johndoe"
  }, {
    id: 2,
    username: "janedoe"
  }]);
});

module.exports = router;
