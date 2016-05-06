'use strict';

var mysql = require('mysql');
var builder = require('xmlbuilder');
var EscapeData = require('../lib/EscapeData');

var moduleName = 'CustomModule2';

exports.getUnsyncd = function(conn, queryCallback){
	conn.query("SELECT id, name, city, cc_iso, district, " +
			   "CONCAT(contact_first_name, ' ', contact_last_name) AS contact_name, contact_email as email, " +
      	       "phone_1 as contact_phone " +
               "FROM properties " +
			   "WHERE status = 1 " +
			   "AND crm_sync = 0", 
		function(queryError, properties, queryFields){
			if (queryError){
				return queryCallback(queryError, null);
			}

			return queryCallback(null, properties);
	});
};

exports.buildXMLSchemaMulti = function(properties){
	var xml = builder.create(moduleName, null, null, {headless: true});

	properties.forEach(function(property, index){
		exports.buildXMLSchemaRow(xml, index, property);
	});
		
	var xmlString = xml.end();
	return xmlString;
};

exports.buildXMLSchemaSingle = function(property){
	var xml = builder.create(moduleName, null, null, {headless: true});
	exports.buildXMLSchemaRow(xml, 0, property);
	var xmlString = xml.end();
	return xmlString;
};

exports.buildXMLSchemaRow = function(xml, index, property){
	var rowEle = xml.ele('row', {'no': index + 1});
		rowEle.ele('FL', {'val': moduleName + ' Name'}, property.id);
        
        var escapeData = new EscapeData();
        var propertyName = escapeData.amp(property.name);
        console.log(propertyName);
        
		rowEle.ele('FL', {'val': 'Property Name'}, propertyName);
		rowEle.ele('FL', {'val': 'Property OTEID'}, property.id);
		rowEle.ele('FL', {'val': 'Email'}, property.email);
		rowEle.ele('FL', {'val': 'City'}, property.city);
		rowEle.ele('FL', {'val': 'Country'}, property.cc_iso);
		rowEle.ele('FL', {'val': 'District'}, property.district);
		rowEle.ele('FL', {'val': 'Contact Name'}, property.contact_name);
		rowEle.ele('FL', {'val': 'Phone'}, property.contact_phone);

	return rowEle;
};

exports.updateCrmSync = function(conn, properties, queryCallback){
	var idsToUpdate = 0;

	if (Array.isArray(properties)){
		var idsMapped = properties.map(function(property){
			return property.id;
		});

		idsToUpdate = idsMapped.join(', ');
	} else {
		idsToUpdate = properties.id;
	}

	conn.query("UPDATE properties SET crm_sync = 1 WHERE id in (" + idsToUpdate + ")", function(queryError, result){
		if (queryError){
			return queryCallback(queryError, 0);
		} else {
			return queryCallback(null, result.affectedRows);
		}
	});
};

exports.getModuleName = function(){
	return moduleName;
}