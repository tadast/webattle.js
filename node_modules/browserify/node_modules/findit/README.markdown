findit
======

Recursively walk directory trees. Think `/usr/bin/find`.

example time!
=============

callback style
--------------

    require('findit').find(__dirname, function (file) {
        console.log(file);
    })

emitter style
-------------

    var finder = require('findit').find(__dirname);
    
    finder.on('directory', function (dir) {
        console.log(dir + '/');
    });
    
    finder.on('file', function (file) {
        console.log(file);
    });

synchronous
-----------

    var files = require('findit').findSync(__dirname);
    console.dir(files);

methods
=======

find(basedir)
-------------
find(basedir, cb)
-----------------

Do an asynchronous recursive walk starting at `basedir`.
Optionally supply a callback that will get the same arguments as the path event
documented below in "events".

Returns an EventEmitter. See "events".

findSync(basedir)
-----------------

Return an array of files and directories from a recursive walk starting at
`basedir`.

events
======

file: [ file, stat ]
--------------------

Emitted for just files which are not directories.

directory : [ directory, stat ]
-------------------------------

Emitted for directories.

path : [ file, stat ]
---------------------

Emitted for both files and directories.

end
---

Emitted when the recursive walk is done.
