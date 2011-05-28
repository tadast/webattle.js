var assert = require('assert');
var find = require('findit');

exports.module = function () {
    assert.eql(find.findSync, find.find.sync);
    assert.eql(find, find.find);
};
