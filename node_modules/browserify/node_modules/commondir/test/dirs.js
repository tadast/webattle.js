var assert = require('assert');
var commondir = require('../');

exports.common = function () {
    assert.equal(
        commondir([ '/foo', '/foo/bar', '/foo/bar/baz' ]),
        '/foo'
    );
    
    assert.equal(
        commondir([ '/a/b/c', '/a/b', '/a/b/c/d/e' ]),
        '/a/b'
    );
    
    assert.equal(
        commondir([ '/x/y/z/w', '/xy/z', '/x/y/z' ]),
        '/'
    );
    
    assert.throws(function () {
        assert.equal(
            commondir([ '/x/y/z/w', 'qrs', '/x/y/z' ]),
            '/'
        );
    });
};

exports.base = function () {
    assert.equal(
        commondir('/foo/bar', [ 'baz', './quux', '../bar/bazzy' ]),
        '/foo/bar'
    );
    
    assert.equal(
        commondir('/a/b', [ 'c', '../b/.', '../../a/b/e' ]),
        '/a/b'
    );
    
    assert.equal(
        commondir('/a/b/c', [ '..', '../d', '../../a/z/e' ]),
        '/a'
    );
};
