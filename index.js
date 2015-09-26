var fs = require('fs')
,   path = require('path')
,   util = require('youtil')

,   minimatch = require("minimatch")

,   pending = 0
,   squareOne = process.cwd()
,   noop = function(){}

exports.clrdir = function(directory, callback) {
    var callback = (typeof directory === "function" && directory) || callback || noop
    ,   directory = (typeof directory === "string" && directory) || "."
    ,   pending = 0

    directory = path.resolve(directory)

    fs.readdir(directory, function(err, results){
        if(err) return callback(err)
        results.length || callback()
        pending = results.length
        results.forEach(function(file){
            file = (directory+path.sep).concat(file)
            fs.lstat(file, function(err, stats){
                if(err) return callback(err)
                if(stats.isFile()){
                    fs.unlink(file, function(err){
                        if(err) return callback(err)
                        --pending || callback()
                    })
                } else if(stats.isDirectory()){
                    exports.clrdir(file, function(err){
                        if(err) return callback(err)
                        fs.rmdir(file, function(err){
                            if(err) return callback(err)
                            --pending || callback()
                        })
                    })
                }
            })
        })
    })
}

exports.cpfile = function(srcDestObjArr, callback) {
    var callback = typeof callback === "function" ? callback : noop

    if( !util.isArray(srcDestObjArr) ) return callback(new Error("First argument to cpfiles must be a valid array."))
    srcDestObjArr.forEach(function(srcDestObj){
        let src = path.resolve(srcDestObj.src)
        ,   dest = path.resolve(srcDestObj.dest)

        if( !util.isPlainObject(srcDestObj) ) return callback(new Error("Array must contain valid objects."))
        if(!src || !dest) return callback(new Error("Object must contain a valid 'src' & 'dest' property."))
        else {
            fs.stat(dest, function(err, stats){
                if(err){
                    exports.mkdirp(dest, function(err){
                        if(err) return callback(err)
                        cpfiles(src, dest)
                    })
                } else if(stats.isDirectory()) {
                    cpfiles(src, dest)
                } else if(stats.isFile()) {
                    return callback(new Error("Destination already exists and is not a directory."))
                } else {
                    return callback(new Error(`The destination ${dest} is neither a file nor a directory.`))
                }
            })
        }
    })

    function cpfiles(src, dest){
        let fileParts = src.split(path.sep)
        ,   pattern = fileParts.pop()
        ,   filePath = fileParts.join(path.sep)

        fs.readdir(filePath, function(err, res){
            if(err) return callback(err)

            res.filter(minimatch.filter(pattern)).forEach(function(file){
                pending++

                let srcFile = filePath+path.sep+file
                ,   destFile = dest+path.sep+file

                fs.lstat(srcFile, function(err, stats){
                    if(err) return callback(err)
                    if(stats.isFile())
                        cpfile(srcFile, destFile, stats)
                    else if(stats.isDirectory()){
                        pending--
                        cpdir(null, srcFile, dest)}
                    else 
                        pending--
                })
            })
        })
    }

    // branch is passed in by recursive function calls.
    function cpdir(branch, src, dest){
        branch = branch || path.sep

        fs.readdir(src+branch, function(err, res){
            if(err) return callback(err)

            res.forEach(function(file){
                pending++            

                var srcFile = src+branch+file
                ,   destFile = dest+branch+file

                fs.lstat(srcFile, function(err, stats){
                    if(err) return callback(err)
                    if(stats.isFile()) {
                        cpfile(srcFile, destFile, stats)
                    } else if(stats.isDirectory()) {
                        fs.mkdir(destFile, function(err) {
                            if(err) {
                                switch(err.code) {
                                    case "EEXIST":
                                        console.log("%s exists so skipping...", destFile)
                                    break
                                    default:
                                        return callback(err)                   
                                }
                            }
                            --pending || callback()
                            cpdir(branch+file+"/", src, dest)
                        })
                    } else pending--
                })
            })
        })
    }

    function cpfile(srcFile, destFile, stats) {
        var i = fs.createReadStream(srcFile, { mode : stats.mode })
        ,   o = fs.createWriteStream(destFile, { mode : stats.mode })
        
        i.pipe(o)
        i.on("end", function(){
            if(!--pending) return callback()
        })        
    }
}

exports.mkdirTree = function( dirTree, callback, parent ) {
    var nodes = Object.keys(dirTree)
    ,   parent = parent ? ~parent.indexOf(path.sep, parent.length-1) ? parent : parent+"/" : ""

    nodes.forEach(function(dir){
        ++pending
        fs.mkdir(parent+dir, function(err){
            if(err && err.code !== "EEXIST") return callback(err)
            --pending
            exports.mkdirTree(dirTree[dir], callback, parent+dir)
            pending === 0 && callback && callback()
        })
    })
}

exports.mkdirTreeSync = function( dirTree, root=true ) {
    for( var node in dirTree ) {
        try{fs.mkdirSync( node )} 
        catch(e){if(e.code !== "EEXIST") throw e}
        process.chdir( node + '/' )
        exports.mkdirTreeSync( dirTree[node], false )
    }
    !root && process.chdir( '../' )
}

exports.mkdirp = function( _path, callback = function(){} ) {
    if( typeof _path !== "string" ) return callback(new Error( "mkdirp needs a valid path."))

    let parts = path.resolve(_path.replace("~", process.env.HOME)).substr(1).split(path.sep)
    ,   current = ""

    ;(function main() {
        if( parts.length > 0 ) {
            current+=path.sep+parts.shift()
            fs.mkdir( current, function( err, res ) {
                if(err && err.code !== "EEXIST") return callback(err)
                main()
            })
        } else callback()
    })()
}