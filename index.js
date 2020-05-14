#! /usr/bin/env node
let { startProcess } = require('./lib/tunnel-local');



const fileName = process.argv[2];
const envName = process.argv[3];
if (!fileName) {
	throw new Error('file name argument missing');
}

const paths = __dirname.split('node_module');
let rootPath = __dirname;

if(paths.length === 2){
	rootPath = paths[0];
}

const absolutePath = rootPath + `/${fileName}`
startProcess(absolutePath, envName)