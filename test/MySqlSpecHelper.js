var mysql = require('mysql');
var settings = require('../app/settings.js');

var self = {
	getSQLConnection: function(connectedCallback){
		var pool = mysql.createPool({
			host: 'localhost',
			user: settings.testing.db_user,
			password: settings.testing.db_pass,
			database: settings.testing.database,
			timezone: 'utc'
		});

		pool.getConnection(function(connectionError, conn){
			if (connectionError){
				console.error(connectionError);
				return false;
			} else {
				return connectedCallback(pool, conn);
			}
		});
	},
	getUnsyncdData: function(model, dataCallback){
		self.getSQLConnection(function(pool, conn){
			model.getUnsyncd(conn, function(queryError, modelData){
				if (queryError){
					pool.end(function (err) {
					  return dataCallback(queryError, null);
					});
				}

				pool.end(function (err) {
				  return dataCallback(null, modelData);
				});
			});
		});
	}
};

module.exports = self;
