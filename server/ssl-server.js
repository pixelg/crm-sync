var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('./server/server.key'),
  cert: fs.readFileSync('./server/server.crt')
};

https.createServer(options, function (req, res) {
	console.log(req.headers);
	console.log(req);

  	res.writeHead(200);
  	res.end("hello world\n");
}).listen(8000);