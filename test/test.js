#!/usr/bin/env node
require("babel/register")({
    ignore : false
})

var assert = require("assert")

, 	fs = require("fs")
, 	path = require("path")

,	mkdirp = require("../index").mkdirp
,	mkdirTree = require("../index").mkdirTree
,	mkdirTreeSync = require("../index").mkdirTreeSync
,	cpfiles = require("../index").cpfiles

,	dirObj1 = {
		test: {
			testDir5: {
				sibling: {
					child1: {
						grandchild: ""
					},
					child2: ""
				}
			}
		}
	}

,	dirObj2 = {
		test: {
			testDir6: {
				sibling1: {
					child1: "",
					child2: {
						grandchild: ""
					},
					child3: ""
				},
				sibling2: ""
			}
		}
	}

describe("mkdirp", function(){
	it("should create directories recursively test/testDir1/one/two/three", function(done){
		mkdirp("test/testDir1/one/two/three", function(err, res){
			expect(err).toBeUndefined()
			expect(fs.statSync("test/testDir1/one/two/three").isDirectory()).toBeTruthy()
			done()
		})
	})
	it("should translate \".\" into the current directory ./test/testDir2/one/two/three", function(done){
		mkdirp("./test/testDir2/one/two/three", function(err, res){
			expect(err).toEqual(undefined)
			expect(fs.statSync("./test/testDir2/one/two/three").isDirectory()).toBeTruthy()
			done()
		})
	})
	it("should translate \"..\" into the parent directory ../tool.fs/test/testDir3/one/two/three", function(done){
		mkdirp("../tool.fs/test/testDir3/one/two/three", function(err, res){
			expect(err).toEqual(undefined)
			expect(fs.statSync("../tool.fs/test/testDir3/one/two/three").isDirectory()).toBeTruthy()
			done()
		})
	})
	it("should translate \"~\" into the user's home directory ~/Workspace/tool.fs/test/testDir4/one/two/three", function(done){
		mkdirp("~/Workspace/tool.fs/test/testDir4/one/two/three", function(err, res){
			expect(err).toEqual(undefined)
			expect(fs.statSync(process.env.HOME+"/Workspace/tool.fs/test/testDir4/one/two/three").isDirectory()).toBeTruthy()
			done()
		})
	})
})
describe("mkdirTreeSync", function(){
	it("should create a directory tree in the current directory", function(){
		mkdirTreeSync(dirObj1)
		expect(fs.statSync("test/testDir5/sibling/child1/grandchild").isDirectory()).toBeTruthy()
	})
})
describe("mkdirTree", function(){
	it("should create a directory tree in the current directory if not passed third parameter", function(done){
		mkdirTree(dirObj2, function(err, res){
			expect(err).toBeUndefined()
			expect(fs.statSync("test/testDir6/sibling1/child2/grandchild").isDirectory()).toBeTruthy()
			done()
		})
	})
	it("should create a directory tree in the absolute directory given as the third parameter", function(done){
		mkdirTree(dirObj2, function(err, res){
			expect(err).toBeUndefined()
			expect(fs.statSync("test/testDir6/sibling1/child2/grandchild/test/testDir6/sibling1/child2/grandchild").isDirectory()).toBeTruthy()
			done()
		}, __dirname+"/testDir6/sibling1/child2/grandchild")
	})
})