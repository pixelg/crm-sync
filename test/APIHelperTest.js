var expect = require('chai').expect;
var apiHelper = require('../lib/APIHelper');

describe('APIHelper', function(){
	describe('#postRequest', function(){
		this.timeout(30000);

		it('should post Guest XML data to the ZohoCRM', function(done){
			var xmlDataMulti = '<CustomModule5><row%20no="1"><FL%20val="CustomModule5%20Name">Brent%20Lee</FL><FL%20val="Guest%20OTEID">1</FL>' + 
						  '<FL%20val="Email">pixelguerrilla@gmail.com</FL><FL%20val="Nationality"/></row>' + 
						  '<row%20no="2"><FL%20val="CustomModule5%20Name">Brent%20Lee</FL><FL%20val="Guest%20OTEID">1</FL>' + 
						  '<FL%20val="Email">pixelguerrilla@gmail.com</FL><FL%20val="Nationality"/></row>' +
						  '</CustomModule5>';

			// var xmlData = '<CustomModule5><row%20no="1"><FL%20val="CustomModule5%20Name">HUGO%20VILLAFAÑA%20Lee</FL><FL%20val="Guest%20OTEID">1</FL>' + 
			// 			  '<FL%20val="Email">pixelguerrilla@gmail.com</FL><FL%20val="Nationality">USA</FL></row>' + 
			// 			  '</CustomModule5>';

			var xmlData = '<CustomModule5><row no="1"><FL val="CustomModule5 Name">HUGO VILLAFAÑA Lee</FL><FL val="Guest OTEID">3</FL>' + 
									  '<FL val="Email">pixelguerrilla@gmail.com</FL><FL val="Nationality"/>' +
									  '</row></CustomModule5>';

			var xmlDataEscaped = encodeURI(xmlData);
			var moduleName = 'CustomModule5';

			var zohoAPIHelper = apiHelper(null);
			zohoAPIHelper.postRequest(moduleName, xmlDataEscaped, null, function(postError, statusCode, stringResponse){
				console.log('HTTP Status Code: ' + statusCode);
				if (postError){
					console.error(postError);
				} else {
					console.log("POST Response: \n");
					console.log(stringResponse);
					console.log("END\n\n");
				}

				done();
			});
		});
	});
	describe('#analyzeResponse', function(){
		it ('should not be successful.', function(done){
			var responseString = '<?xml version="1.0" encoding="UTF-8" ?> ' + 
			                     '<response uri="/crm/private/xml/CustomModule5/insertRecords">' +
								    '<error>' +
								        '<code>4832</code>' +
								        '<message>You have given a wrong value for the field : Guest OTEID</message>' +
								    '</error>' +
								'</response>';

			var zohoAPIHelper = apiHelper(null);
			zohoAPIHelper.analyzeResponse(responseString, function(parseError, success){
				expect(success).to.equal(false);
				done();
			});
		});
	});
	describe('#analyzeResponse', function(){
		it ('should be successful.', function(done){
			var responseString = '<?xml version="1.0" encoding="UTF-8" ?>' +
									'<response uri="/crm/private/xml/CustomModule5/insertRecords">' +
									    '<result>' +
									        '<message>Record(s) added successfully</message>' +
									        '<recorddetail>' +
									            '<FL val="Id">1184072000000799008</FL>' +
									            '<FL val="Created Time">2015-10-27 09:54:13</FL>' +
									            '<FL val="Modified Time">2015-10-27 09:54:13</FL>' +
									            '<FL val="Created By">' +
									                '<![CDATA[Lee]]>' +
									            '</FL>' +
									            '<FL val="Modified By">' +
									                '<![CDATA[Lee]]>' +
									            '</FL>' +
									        '</recorddetail>' +
									    '</result>' +
									'</response>';

			var zohoAPIHelper = apiHelper(null);
			zohoAPIHelper.analyzeResponse(responseString, function(parseError, success){
				expect(success).to.equal(true);
				done();
			});
		});
	});
});