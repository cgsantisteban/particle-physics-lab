#!/usr/bin/env node 

const os = require('os');
const {exec} = require('child_process');
const ArgumentParser = require('argparse').ArgumentParser;
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const http = require('http');
const ioSocket = require('socket.io');

var websocket = require('./api/websocket');
var config = require('./api/config');

var parser = new ArgumentParser({
  version: '0.1.0',
  addHelp:true,
  description: 'Particle Physics Laboratory. Front-end for GAMOS'
});



parser.addArgument(
	  [ '-a', '--address' ],
	  {
	    help: 'Server address',
	    required : false,
	    defaultValue: "localhost"
	  }
);

parser.addArgument(
  [ '-p', '--port' ],
  {
    help: 'Port server',
    required : true
  }
);

parser.addArgument(
  [ '-d', '--dir' ],
  {
    help: 'Temporary experiment folder',
    required: true
  }
);

parser.addArgument(
  [ '-m', '--mongo' ],
  {
    help: 'Mongo database (y/n), default value is no',
    required: false,
    defaultValue: "n"
  }
);
		 
let args = parser.parseArgs();

//mongo
if(args.mongo === 'yes' || args.mongo === 'y'){
	config.isMongo = true;
}


//express
let app = require('./api/app');
app.set('host',"127.0.0.1");
if(args.address != null){
	app.set('host',args.address);
}

var portApp = null,
	tmpDir = null;

exec('which gamos | wc -w', (error, outGAMOS, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  
  
  if(outGAMOS == 1){ //is GAMOS
	  
	  
		if(args.dir != null) tmpDir = path.resolve(args.dir);
		else {
			console.log('Incorrect temporary directory');
			process.exit();
		}
			
		portApp = Number(args.port);
		if(!Number.isInteger(portApp) || portApp <= 0){
			console.error('Incorrect port number (port must be a positive integer):', args.port);
			process.exit();
		}
		
		
		
		config.port = portApp;
		config.tmpDir = tmpDir;
				
		fs.stat(tmpDir, (err,stat)=>{
				
			if(err){
				if(err.errno === -2){
					fs.mkdir(tmpDir, (err)=>{
						if(err){
							console.error(err);
					 		process.exit();
					 	}
						buildServer(portApp,tmpDir);
					});
				}
				else{
					console.log(err);
					process.exit();
				}
			}
			else {
						
				fs.access(tmpDir, fs.constants.R_OK | fs.constants.W_OK, (err) => {
				  if(err) {
						  console.error(err);  
						  process.exit();
					  }
					  else {
						  buildServer(portApp,tmpDir);
					  }
				});
					
			}
				
		});
		
	
	  
  }
  else{
	  
	  console.log('Please, install GAMOS in your system or set the GAMOS environment variables (GAMOS_PATH/conf/confgamos.sh file)');
	  process.exit();
  }
 
});



function buildServer(port,tmpDir){
	
	app.set('port', process.env.PORT || port);
	
	var httpServer = http.createServer(app);
	var io = ioSocket.listen(httpServer);
	
	
	websocket.connect(io,tmpDir);

	httpServer.listen(app.get('port'),app.get('host'),()=>{
		console.log("Listening on " + app.get('host') + ':' + app.get('port'));
	});
	
	httpServer.on('error', (e) => {
	  if (e.code == 'ENOTFOUND') {
		  console.log('Error: Address <'+app.get('host')+'> not found');
		  console.log('Server closed');
	  }
	  else{
		  console.log(e);
	  }
	  httpServer.close();
	  process.exit();
   });
	
}

