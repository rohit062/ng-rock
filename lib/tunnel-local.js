const fs = require('fs');
const open = require('open');
const { spawn } = require('child_process');


let activeProcess;

async function startProcess(absolutePath, envName) {
	const fileCheck = fs.existsSync(absolutePath);

	// file check
	if (!fileCheck) {
		throw new Error('file does not exist');
	}

	let dir = __dirname + '/../bin/';
	const start = ['start'];
	start.push('--log=stdout');
	start.push(`-config=${absolutePath}`);
	if(envName){
		start.push(envName);
	}
	const ngrok = spawn('./ngrok', start, { cwd: dir });
	let tunnelInfo = [];
	let inspectAddress = '';
	ngrok.stdout.on('data', data => {
		activeProcess = 1;
		const msg = data.toString();
		if(msg.includes('msg="started tunnel"')){
			tunnelInfo.push(msg);
		}
		if(msg.includes('msg="starting web service" obj=web addr=')){
			inspectAddress = msg.split('msg="starting web service" obj=web addr=')[1];
		}
		console.log(msg);
	});

	setTimeout(()=>{
		if(inspectAddress){
			open("http://"+inspectAddress.trim());
		}
	}, 5000)

	setTimeout(()=>{
		if(tunnelInfo){
			console.info("Tunnel Info :" + tunnelInfo);
		}
	}, 5000)

	setTimeout(()=>{
		if(tunnelInfo){
			console.info("Tunnel Info :" + tunnelInfo);
		}
	}, 10000)

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

exports.startProcess = startProcess;