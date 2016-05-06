'use strict';

var expect = require('chai').expect;
var mainApp = require('../app/main');

describe('Main', function(){
	describe('#test', function(){
		it('should return true.', function(){
			var result = mainApp.test();
			expect(result).to.equal(true);
		});
	});
});