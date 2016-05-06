var https = require('https');

var xmlData = '<CustomModule5><row%20no="1"><FL%20val="CustomModule5%20Name">HUGO%20VILLAFAÑA%20Lee</FL><FL%20val="Guest%20OTEID">1</FL>' + 
			  '<FL%20val="Email">pixelguerrilla@gmail.com</FL><FL%20val="Nationality">USA</FL></row>' + 
			  '</CustomModule5>';

var options = {
    host: 'localhost',
    port: 8000,
    path: '/?xmlData=' + xmlData,
    method: 'POST',
    headers: {'Content-Type': 'text/xml;charset=utf-8','charset': 'utf-8'}
};

// console.log(xmlData);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var statusCode = 0;
var request = https.request(options, function(response){
    console.log(response.statusCode);
   	
    response.on('data', function(chunk){
        process.stdout.write(chunk);
    });
});

request.end();
request.on('error', function(error){
   console.error(error);
});