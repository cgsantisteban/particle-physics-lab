"use strict";

const fs = require('fs');
const spawn = require("child_process").spawn;

exports.fitHistogram = function(data,homeExp,socket){
	
	var rootFile = homeExp + '/' + data.actionName + '.root', 
		outFitFile = homeExp + '/' + data.outFitFile,				
	    histogram = data.histogram,
	    nPoints = data.nPoints,
	    nFunc = data.funcList.length,
	    funcList = data.funcList,
	    rangeFit = data.rangeFit,
	    range = data.range;
	
	var homeDir = __dirname;
	var binDir = __dirname + '/..' + '/bin'; 
	var command = binDir + '/' + 'fitHistogram'; 
	var args = [];
	
	args.push(rootFile, outFitFile, histogram, nPoints, nFunc);
	args = args.concat(funcList, rangeFit, range);

	var fit = spawn(command, args);
	var fitJSON;
	var outFit = [];
	var outData = [];
	
	fit.stdout.on("data", (data)=>{
		//console.log(data.toString());
 	});	

	fit.stderr.on('data', (data)=> {
			console.log('ps stderr: ' + data);
	});
	
	fit.on('exit', (exitCode)=> {
        	
   		if(typeof exitCode !== 'undefined') {
				fs.readFile(outFitFile,(err,data)=>{
					if(err){
				 		var error = {
								'file': outFitFile,
								'description': err
							};
						socket.emit('error:File',error);
				 		console.error(err);
				 	}
					
					var fitJSON = data.toString(); 
					socket.emit('exp:outFit',fitJSON);
					fs.unlink(outFitFile,(err)=>{
						if(err) console.error('Error:',err);
					});
				});
   			
     		}
         	else{
         		socket.emit('error:ROOTRun',{'exitCode': exitCode});
	        }
     	});	
	
	
}

