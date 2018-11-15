"use strict";


const fs = require('fs');
const _ = require('lodash');
const spawn = require("child_process").spawn;

let histoModule = require('../server/GAMOS/js/histoParser'),
	parserOutGAMOS = require('../server/GAMOS/js/parserOutGAMOS'),
	parserOutPythia = require('../server/Pythia8/js/parserOutPythia'),
	eventPythiaParser = require('../server/Pythia8/js/buildNodes');

let	pythia = require('../server/Pythia8/js/buildPythiaMacro'),
	pythiaDataList = require('../server/Pythia8/js/buildPythiaDataList'),
	fit = require('../server/ROOT/js/fitHistogram');

let consoleGAMOS = require('./consoleGAMOS');

let buildExperiment = function(expJSON,homeExp,socket,isTerminal,ptyProcess,cmd,argv){
	
	
	
	let isPythia = false; //expJSON.isPythia; //<---remove pythia
	
	let	geomFile = expJSON.geom.fileName,
		macroFile = expJSON.macro.fileName;
	
	let geomArray = expJSON.geom.geomCommands,
 		macroArray = expJSON.macro.macroCommands;

	let gFile = homeExp + '/' + geomFile,
		mFile = homeExp + '/' + macroFile;
	let geomStream = fs.createWriteStream(gFile),
	 	macroStream = fs.createWriteStream(mFile);
	 
	geomStream.on('error', (err)=> { 
	 	if(err){
	 		let error = {
					'file': gFile,
					'description': err
				};
			socket.emit('error:File',error);
	 		console.error(err);
	 	} 
	 });
	
	macroStream.on('error', (err)=> { 
	 	if(err){
	 		let error = {
					'file': mFile,
					'description': err
				};
			socket.emit('error:File',error);
	 		console.error(err);
	 	} 
	 });
	
	//pythia generator
	if(isPythia){
		
		let pythiaFile = expJSON.pythiaData.pythiaFile + '.cmnd',
			pythiaDataListFile = homeExp + '/' + expJSON.pythiaData.pythiaFile + '.csv',
			pFile = homeExp + '/' + pythiaFile,
			pOutEventFile = homeExp + '/' + expJSON.pythiaData.pythiaOutEventFile,
			pOutDataFile = homeExp + '/' + expJSON.pythiaData.pythiaOutDataFile;
	
		let pythiaBeam = expJSON.pythiaData.pythiaBeam,
			processList = expJSON.pythiaData.processList;
		let pythiaArray = pythia.buildPythiaMacro(pythiaBeam,processList,expJSON.nBeams);
		let pythiaStream = fs.createWriteStream(pFile);
		let pythiaDataListStream = fs.createWriteStream(pythiaDataListFile);
		
		pythiaStream.on('error', (err)=> { 
		 	if(err){
		 		let error = {
						'file': pFile,
						'description': err
					};
				socket.emit('error:File',error);
		 		return console.error(err);
		 	}
		});
		
		let pythiaDataListArray = pythiaDataList.buildPythiaDataList(expJSON.pythiaData.pythiaHistograms);
		pythiaDataListStream.on('error', (err)=> { 
		 	if(err){
		 		let error = {
						'file': pythiaDataListFile,
						'description': err
					};
				socket.emit('error:File',error);
		 		return console.error(err);
		 	} 
		});
		
		pythiaArray.forEach((line)=> { 
		 	pythiaStream.write(line + '\n'); 
		 });
		
		pythiaStream.end();
		
		pythiaStream.on('finish', ()=> {
			socket.emit('exp:buildPythia',true);
			pythiaDataListArray.forEach((line)=> { 
				pythiaDataListStream.write(line + '\n');
			 	
			});
			pythiaDataListStream.end();
		
		 });
		
		pythiaDataListStream.on('finish', ()=> {
			socket.emit('exp:buildPythiaDataList',true);
			geomArray.forEach((line)=> { 
			 	geomStream.write(line + '\n');
			});
			geomStream.end();
		
		 });
		 				
		geomStream.on('finish', ()=> {
			socket.emit('exp:buildGeom',true);
			macroArray.forEach((line)=> { 
			 	macroStream.write(line + '\n');
			});
			macroStream.end();
		 });
		
		macroStream.on('finish', ()=> {
			socket.emit('exp:buildMacro',true);
			runExperiment(homeExp,socket,expJSON);
		});
		
	}
	else{
		geomArray.forEach((line)=> { 
		 	geomStream.write(line + '\n'); 
		 });
		geomStream.end();
		
		geomStream.on('finish', ()=> {
			socket.emit('exp:buildGeom',true);
			macroArray.forEach((line)=> { 
			 	macroStream.write(line + '\n');
			});
			macroStream.end();
		 });
		
		macroStream.on('finish', ()=> {
			socket.emit('exp:buildMacro',true)
			if(!isTerminal){
				runExperiment(homeExp,socket,expJSON);
			}
			else{
				consoleGAMOS.runCmd(ptyProcess,cmd,argv,socket,expJSON,homeExp);
			}
			
	 	});
	}
	
	
}

let runGamos = function(socket,homeExp,nBeams,macroFile,actionList,scorerList){
	
	
	
	let command = "gamos";
	let args = [macroFile];
	let gamos = spawn(command,args,{cwd: homeExp, detached: true}); 
	
	socket.emit('exp:beginSimulation',true);
	gamos.stdout.on("data", (data)=>{
		let out = data.toString().split('\n');
		parserOutGAMOS.parserOutGAMOS(out,socket,homeExp); 
	});	
	
	gamos.on('exit', (exitCode)=> {
          
	       let errorFile = homeExp +'/gamos_error.log';
	       fs.stat(errorFile,(err,stat)=>{
	    	   if(err == null){
	    		   if(stat.size>0){
	    			   fs.readFile(errorFile,(err,dataError)=>{
	    				   if(err){
	    					   throw err;
	    				   }
	    				   let description = dataError.toString().split('\n');
	    				   let error = {
	    						'isError': true,   
	    				       	'description': description
	    			           };
	    				   socket.emit('error:GAMOSRun',error);
	    				   socket.emit('exp:endGAMOSRun', -1);
	    				   console.error(dataError.toString());
	    			   });
	    		   }else{
	    			   if(exitCode != null){
						   socket.emit('exp:nEvent', nBeams);
				           //histoModule.buildHistos(expJSON,socket,homeExp);
						  
						   histoModule.buildHistos(actionList,scorerList,socket,homeExp);
					   	   socket.emit('exp:endGAMOSRun', exitCode);
					   }
	    		   }
	    	   }else{
	    		   console.error(err);
	    	   }
	       });
	       
       });	
	
	gamos.stderr.on('data', (data)=>{
		let dataError = data.toString().split('\n');
		let error = {
           	'description': dataError
           };
        socket.emit('error:GAMOSRun',error);
	});
	
	
	socket.on('disconnect',(data)=>{
		gamos.kill('SIGHUP'); 
	});
	
	return gamos;
}

let runExperiment = function(homeExp,socket,expJSON){
	
	let pythia, gamos; 
	let macroFile = expJSON.macro.fileName;
	let nBeams = expJSON.nBeams;
	let actionList = expJSON.actionList,
		scorerList = expJSON.scorerList;
	
	if(expJSON.isPythia){
			
		let pythiaMacro = expJSON.pythiaData.pythiaFile + '.cmnd',
			pOutEventFile = expJSON.pythiaData.pythiaOutEventFile,
			pOutDataFile = expJSON.pythiaData.pythiaOutDataFile,
			pDataList = expJSON.pythiaData.pythiaFile + '.csv',
			pHistogram = expJSON.pythiaData.pythiaOutHistogramFile;
		
		let pythiaCommand = __dirname + '/../' + '/Server/Pythia8/bin/pythiaGenerator';
		
		let args = [homeExp, pythiaMacro, pDataList, pOutEventFile, pOutDataFile, pHistogram];
		pythia = spawn(pythiaCommand,args,{cwd: homeExp, detached: true});
		
		socket.emit('exp:beginPythiaRun',true);
		
		let errorPythiaRun = {"isError": false};
		pythia.stdout.on("data", (data)=>{
			let out = data.toString(),
				lines = out.split('\n');
			
			for(let i=0;i<lines.length;i++){
				socket.emit('exp:outDataSimulation',lines[i]);
			}
			
			parserOutPythia.parserOutPythia(lines,socket); 
			
			
			/*let isError = _.includes(out, 'PYTHIA Error'); 
			if(!isError){
				parserOutPythia.parserOutPythia(lines,socket); 
			}
			else{
				errorPythiaRun = {
						"isError": isError,
						'description': 'Pythia execution failed'
       				
       			};
   				socket.emit('error:PythiaRun',errorPythiaRun);
				pythia.kill('SIGHUP');
			}*/
	 		
	 	});
  		
		pythia.stderr.on('data', (data)=>{
			let dataError = data.toString().split('\n');
			let error = {
					'isError': true,
					'description': dataError
	           };
	        socket.emit('error:PythiaRun',error);
		  
		});
		
		pythia.on('exit',(exitCode)=>{
			socket.emit("exp:endPythiaRun", errorPythiaRun);
			if(exitCode !== null && !errorPythiaRun.isError){
				
				let histogramJSON = homeExp + '/' +pHistogram + '.json';
				if(expJSON.pythiaData.pythiaHistograms.length>0){
					fs.stat(histogramJSON, (err)=> {
						if(err == null){
							fs.readFile(histogramJSON, (err, histogram) => {
							  if(err){
							 		let error = {
											'file': histogramJSON,
											'description': err
										};
									socket.emit('error:File',error);
							 		console.error(err);
							 	}
							  socket.emit('exp:pythiaHistogram',histogram.toString());
							});
							
						}
						else{
							let error = {
									'file': histogramJSON,
									'description': 'no exists'
								};
							socket.emit('error:File',error);
							console.error(error);
						}
					});
				}else{
					socket.emit('exp:pythiaHistogram',null);
				}
				
				let eventCardFile = homeExp + '/' + pOutEventFile;
				fs.stat(eventCardFile, (err)=> {
					if(err == null){
						eventPythiaParser.buildNodes(eventCardFile,socket);
					}
					else{
						let error = {
									'file': pOutEventFile,
									'description': 'File does not exist'
								};
						socket.emit('error:File',error);
					}
				});
				 
				let hepFile = homeExp + '/' + pOutDataFile;
				fs.stat(hepFile,  (err)=> {
					if(err == null){
						gamos = runGamos(socket,homeExp,nBeams,macroFile,actionList,scorerList);
					}
					else{
						let error = {
								'file': pOutDataFile,
								'description': 'File does not exist'
							};
						socket.emit('error:File',error);
				 		console.error(error);
					}
				});
				
			}//if(exitcode)
			
		});
		
	}else{
		gamos = runGamos(socket,homeExp,nBeams,macroFile,actionList,scorerList);
	}
	socket.on('exp:Kill',function(data){
		if(typeof pythia != 'undefined') pythia.kill('SIGHUP'); 
		if(typeof gamos != 'undefined') gamos.kill('SIGHUP');  //cancel simulation
		
	});
	
}

module.exports = {
  buildExperiment: buildExperiment
};



