const fs = require('fs');
const { spawn } = require('child_process');
const fileName = process.argv[2];
const envName = process.argv[3];
if (!fileName) {
	throw new Error('file name argument missing');
}
const absolutePath = __dirname + `/../${fileName}`
const fileCheck = fs.existsSync(absolutePath);

// file check
if (!fileCheck) {
	throw new Error('.ngrock.js does not exist');
}

let activeProcess;

async function startProcess() {
	let dir = __dirname + '/../bin/';
	const start = ['start'];
	start.push('--log=stdout');
	start.push(`-config=${absolutePath}`);
	if(envName){
		start.push(envName);
	}
	const ngrok = spawn('./ngrok', start, { cwd: dir });

	ngrok.stdout.on('data', data => {
		activeProcess = 1;
		const msg = data.toString();
		console.log("NGROK :", msg);
	});

	ngrok.stderr.on('data', data => {
		activeProcess = null;
		console.log("ERROR :", data);
		process.exit(1);
	});

	ngrok.on('exit', () => {
		activeProcess = null;
	});

	process.on('exit', async () => await killProcess());

}

function killProcess() {
	if (!activeProcess) return;
	return new Promise(resolve => {
		activeProcess.on('exit', () => resolve());
		activeProcess.kill();
	});
}

startProcess();
