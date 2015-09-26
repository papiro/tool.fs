#!/usr/bin/env node
require("babel/register")({
    ignore : false
})

var	fs = require("fs")
, 	path = require("path")

,	mkdirp = require("../index").mkdirp
,	mkdirTree = require("../index").mkdirTree
,	mkdirTreeSync = require("../index").mkdirTreeSync
,	cpfile = require("../index").cpfile
, 	clrdir = require("../index").clrdir

,	bomb_shelt = "test/bomb_shelt/"
,	testData = require('./data/data.json')
,	pending = 0

__dirname+="/bomb_shelt/"

describe("mkdirp", function(){
	it("should create directories recursively "+bomb_shelt+"testDir1/one/two/three", function(done){
		mkdirp(bomb_shelt+"testDir1/one/two/three", function(err){
			expect(err).toBeUndefined()
			expect(fs.statSync(bomb_shelt+"testDir1/one/two/three").isDirectory()).toBeTruthy()
			done()
		})
	})
	it("should translate \".\" into the current directory ./"+bomb_shelt+"testDir2/one/two/three", function(done){
		mkdirp("./"+bomb_shelt+"testDir2/one/two/three", function(err){
			expect(err).toEqual(undefined)
			expect(fs.statSync("./"+bomb_shelt+"testDir2/one/two/three").isDirectory()).toBeTruthy()
			done()
		})
	})
	it("should translate \"..\" into the parent directory ../tool.fs/"+bomb_shelt+"testDir3/one/two/three", function(done){
		mkdirp("../tool.fs/"+bomb_shelt+"testDir3/one/two/three", function(err){
			expect(err).toEqual(undefined)
			expect(fs.statSync("../tool.fs/"+bomb_shelt+"testDir3/one/two/three").isDirectory()).toBeTruthy()
			done()
		})
	})
	it("should translate \"~\" into the user's home directory ~/toolFSTest/"+bomb_shelt+"testDir4/one/two/three", function(done){
		mkdirp("~/toolFSTest/"+bomb_shelt+"testDir4/one/two/three", function(err){
			expect(err).toEqual(undefined)
			expect(fs.statSync(process.env.HOME+"/toolFSTest/"+bomb_shelt+"testDir4/one/two/three").isDirectory()).toBeTruthy()
			done()
		})
	})
})

describe("mkdirTreeSync", function(){
	it("should create a directory tree in the current directory", function(){
		mkdirTreeSync(testData.dirObj1)
		expect(fs.statSync(bomb_shelt+"testDir5/sibling/child1/grandchild").isDirectory()).toBeTruthy()
	})
})

describe("mkdirTree", function(){
	it("should create a directory tree in the current directory if not passed third parameter", function(done){
		mkdirTree(testData.dirObj2, function(err){
			expect(err).toBeUndefined()
			expect(fs.statSync(bomb_shelt+"testDir6/sibling1/child2/grandchild").isDirectory()).toBeTruthy()
			done()
		})		
	})
	it("should create a directory tree in the absolute directory given as the third parameter", function(done){
		mkdirTree(testData.dirObj2, function(err){
			expect(err).toBeUndefined()
			expect(fs.statSync(bomb_shelt+"testDir6/sibling1/child2/grandchild/"+bomb_shelt+"testDir6/sibling1/child2/grandchild").isDirectory()).toBeTruthy()
			done()
		}, __dirname+"testDir6/sibling1/child2/grandchild")
	})
})


describe("cpfile", function(){
	it("should be able to copy single files and single directories", function(done){
		cpfile([{
			src: "test/data/data.json",
			dest: bomb_shelt+"cpfile"
		}, {
			src: "node_modules/jasmine-node/README.md",
			dest: bomb_shelt+"cpfile"
		}, {
			src: "node_modules/babel/src",
			dest: bomb_shelt+"cpfile"
		}], function(err){
			expect(err).toBeUndefined()
			expect(fs.statSync(bomb_shelt+"cpfile/data.json").isFile()).toBeTruthy()
			expect(fs.statSync(bomb_shelt+"cpfile/README.md").isFile()).toBeTruthy()
			expect(fs.statSync(bomb_shelt+"cpfile/babel/util.js").isFile()).toBeTruthy()
			done()
		})
	})
	it("should handle ** globbing", function(done){
		cpfile([{
			src: "node_modules/babel/lib/**",
			dest: bomb_shelt+"cpfile/globbing/doubleStar"
		}], function(err){
			expect(err).toBeUndefined()
			done()
		})
	})
	it("should handle ? globbing", function(done){
		cpfile([{
			src: bomb_shelt+"../../node_modules/youtil/*.??",
			dest: bomb_shelt+"cpfile/globbing/questionMark"
		}], function(err){
			expect(err).toBeUndefined()
			expect(fs.statSync(bomb_shelt+"cpfile/globbing/questionMark/README.md").isFile()).toBeTruthy()
			done()
		})
	})
	it("should handle * globbing", function(done){
		cpfile([{
			src: "node_modules/babel/lib/*",
			dest: bomb_shelt+"cpfile/globbing/singleStar"
		}], function(err){
			expect(err).toBeUndefined()
			done()
		})
	})
})

describe("clrdir", function(){
	it("should clear the contents of a directory", function(done){
		clrdir(bomb_shelt, function(err){
			expect(err).toBeUndefined()
			expect(fs.readdirSync(bomb_shelt)).toEqual([])
			done()
		})
	})
})