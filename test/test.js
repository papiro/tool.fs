#!/usr/bin/env node
require("babel/register")({
    ignore : false
})

var assert = require("assert")

,	cpfiles = require("../index.js").cpfiles

assert.strictEqual(cpfiles([{
	src : "../*.json",
	dest : "cpdirTestDest"
}], function(err){
	if(err) return console.error(err)
	return fs.readdirSync("cpdirTestDest")
}), ["package.json"])