const fs = require('fs');
const { spawn } = require('child_process');

const fileCheck = fs.existsSync(__dirname+'/../.ngrock.js');

// file check
if(!fileCheck){
  throw new Error('.ngrock.js does not exist');
}

//load the file in memory
const ngConfig = require(__dirname+'/../.ngrock.js');

let processPromise, activeProcess;

async function startProcess (opts) {
  let dir = __dirname + '/../bin/';
  const start = ['http'];
  if(ngConfig.port){
    start.push(ngConfig.port)
  }
  start.push('--log=stdout');
  console.log('jknjda',start)

	const ngrok = spawn('./ngrok', start, {cwd: dir});

	let resolve, reject;
	const apiUrl = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	ngrok.stdout.on('data', data => {
    const msg = data.toString();
    console.log(msg);
		if (opts.onLogEvent) {
			opts.onLogEvent(msg.trim());
		}
		if (opts.onStatusChange) {
			if (msg.match('client session established')) {
				opts.onStatusChange('connected');
			} else if (msg.match('session closed, starting reconnect loop')) {
				opts.onStatusChange('closed');
			}
		}
	});

	ngrok.stderr.on('data', data => {
		const msg = data.toString().substring(0, 10000);
		reject(new Error(msg));
	});

	ngrok.on('exit', () => {
		processPromise = null;
		activeProcess = null;
	});

	process.on('exit', async () => await killProcess());

	try {
		const url = await apiUrl;
		activeProcess = ngrok;
		return url;
	}
	catch(ex) {
		ngrok.kill();
		throw ex;
	}
	finally {
		// Remove the stdout listeners if nobody is interested in the content.
		if (!opts.onLogEvent && !opts.onStatusChange) {
			ngrok.stdout.removeAllListeners('data');
		}
		ngrok.stderr.removeAllListeners('data');
	}
}

function killProcess ()  {
	if (!activeProcess) return;
	return new Promise(resolve => {
		activeProcess.on('exit', () => resolve());
		activeProcess.kill();
	});
}

startProcess({});