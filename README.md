# tool.fs
A lean collection of node utilities focused on the fs module

## Syntax

```
var toolfs = require("tool.fs")

, 	dirStruct = {
		"root": {
			"first": "",
			"second": {
				"child1": {
					"grandchild1": "",
					"etc": "andSoOn"
				}
			}
		}
	}

toolfs.mkdirp("some/recursive/directories", callback)
toolfs.mkdirTree(dirStruct, callback)
toolfs.mkdirTreeSync(dirStruct)
toolfs.cpfile([{
	src: "/home/user/absolute/path",
	dest: "other/directory"
}, {
	src: "relative/path",
	dest: ""
}, {
	src: "./*.js",
	dest: "./levelDeeper"
}, {
	src: "**/glo??ing[pattern].js*",
	dest: "../"
}], callback)
toolfs.mklink("path/to/file/or/directory/to/link/to", "path/with/filename/where/link/will/reside"[, "soft" OR "hard"])
toolfs.clrdir("empty/this/directory", callback[, removeRoot<Boolean>])
```

* cpfile uses minimatch to fulfill the globbing patterns
* mklink will make a soft link (fs.symlink) by default.  If passed "hard" but 
	the file is a directory, will switch to "soft" internally.
* clrdir will not follow symlinks.
** pass *true* as the optional third parameter if you'd like to also remove the directory itself after the contents have been recursively removed.