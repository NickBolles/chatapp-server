var mode   = process.env.NODE_ENV || 'development';
var config  = require('../config/config.js')[mode];
var dbConf = config.db;

//Load any mongoose models here
var User = require('../models/user.js'); //user will load all sub models too

var mongoose = require('mongoose');
var dbURL = 'mongodb://' + dbConf.username + ':'+dbConf.pass + '@' + dbConf.host + ':'+dbConf.port+'/'+dbConf.database+'?'+dbConf.options;
mongoose.connect(dbURL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('connected to database :: '+dbConf.database+' on '+dbConf.host+':'+dbConf.port+' as '+dbConf.username);
    console.log('=======================================================================');

});

module.exports = db;