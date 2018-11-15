"use strict";
 
const fs = require('fs');
const fse = require('fs-extra');
const spawn = require("child_process").spawn;
const _ = require("lodash");
const os = require('os');
const pty = require('node-pty');

let config = require('./config');

let	pythia = require('../server/Pythia8/js/buildPythiaMacro'),
	pythiaDataList = require('../server/Pythia8/js/buildPythiaDataList'),
	fit = require('../server/ROOT/js/fitHistogram');


let buildExperiment = require('./buildExperiment');
let consoleGAMOS = require('./consoleGAMOS');
let expList = [];
let ptyProcessList = [];

exports.connect = function(io,homeDir){
	
	io.sockets.on('connection',(socket)=>{
		
		socket.emit('exp:isMongo',config.isMongo);
		
		let time = new Date().getTime(); 
    		let folderExp = 'exp-'+time;
    		let homeExp = homeDir + '/' + folderExp;
    	
	    	fse.mkdirs(homeExp, (err)=> {
	    		if(err){
			 		let error = {
	  						'isError': true,
	  						'description': "Experiment folder has not been created"
	  					};
	  				socket.emit('error:FolderExp',error);
			 		return console.error(err);
			 	}
				console.log('new client, folder-->',folderExp);
				config.expId = folderExp;
				expList.push(folderExp);
				//---->WARNING: all files are deleted------------
				/*
				  
				  fs.readdir(homeDir, (err, files) => {
					  files.forEach(file => {
					    
						  if(expList.indexOf(file)<0){
							  fse.remove(homeDir +'/' + file, (err)=> {
								  if (err){
									  return console.error(err) 
								  } 
								   
							  });
						  }
						  
					  });
				})*/
			
				/*for(let i=0; i<ptyProcessList.length;i++){
					let p = ptyProcessList[i]
					if(expList.indexOf(p.homeExp)<0){//no existe el experimento
						try{
			    			
			    			process.kill(pty.pid,'SIGHUP');
			    			_.remove(ptyProcessList, (ptyProcess)=> {
			    			    return ptyProcess.pid === p.pid;
			    			});
			    			
			    		}catch(err){
			    			console.log(err);
			    		}
					}
				}*/
			
	    	});
    			
		
		socket.on('newExperiment', ()=>{
			fse.remove(homeExp, (err)=> {
			  if (err){
				  return console.error(err); 
			  } 
			});
			
			let time = new Date().getTime(); 
			folderExp = 'exp-'+time;
			config.expId = folderExp;
			homeExp = homeDir + '/' + folderExp;
			fse.mkdirs(homeExp, (err)=> {
	    		if(err){
	    			let error = {
	  						'isError': true,
	  						'description': "Experiment folder has not been created"
	  					};
	  				socket.emit('error:FolderExp',error);
					return console.error(err);
			 	}
	    		
			});
		
		});
	
	    socket.on('exp:Run', (data)=>{
	    	
	    	fse.emptyDir(homeExp, (err)=> {
	    		  if (err) {
	    			  let error = {
	  						'isError': true,
	  						'description': "Experiment folder is not empty"
	  					};
	  				socket.emit('error:FolderExp',error);
	  		 		return console.error(err);
	    		  }
	    		 
	    		  let expJSON = data;
	    		  
	    		  let isTerminal = false;
	    		  buildExperiment.buildExperiment(expJSON,homeExp,socket,isTerminal);
	    	});
	    	   
	    })//exp:Run
	    
		socket.on('exp:Fit', (data)=>{
			fit.fitHistogram(data,homeExp,socket);
		});
	    
	    	   
	    let ptyProcess = null;
	    socket.on('exp:InitConsole',()=>{
	    	if(ptyProcess != null){
	    		try{
		    		process.kill(ptyProcess.pid,'SIGHUP');
		    		ptyProcess = null;
		    	}
		    	catch(err) {
		    	   console.log(err);
		    	}
	    	}
	    	
    		let shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
 	    	ptyProcess = pty.spawn(shell, [], {
 	    	  name: 'xterm-color',
 	    	  cols: 120,
 	    	  rows: 30,
 	    	  cwd: homeExp, //process.env.HOME,
 	    	  env: process.env
 	    	});
		 	  
 	    	socket.emit('exp:ConsolePid',ptyProcess.pid);
 	    	
 	    	consoleGAMOS.runCmd(ptyProcess,'gamos',null,socket,null,homeExp,true);
			
	    })
	    
	    socket.on('exp:Console',(ptyCmd)=>{
	    	
	    	if(ptyCmd.cmd === '/control/execute'){
		   		  let expConsole = ptyCmd.expJSON;
		   		  fse.emptyDir(homeExp, (err)=> {
		    		  if (err) {
		    			  let error = {
		  						'file': folderExp,
		  						'description': "Experiment folder" 
		  					};
		  				socket.emit('error:File',error);
		  		 		return console.error(err);
		    		  }
		    		  let isTerminal = true;
		    		  buildExperiment.buildExperiment(expConsole,homeExp,socket,isTerminal,ptyProcess,ptyCmd.cmd,ptyCmd.argv);
		   		  });
		  		  
		  	  	}
	    	else{
	    		consoleGAMOS.runCmd(ptyProcess,ptyCmd.cmd,ptyCmd.argv,socket,null,homeExp,false);
	    	}
	    	
	    });
	    
	    socket.on('disconnect', () => {
			fse.remove(homeExp, (err)=> {
				  if (err){
					  return console.error(err) 
				  } 
				  
				})
			//kill ptyProcess
			if(typeof ptyProcess != 'undefined'){
				if(ptyProcess != null){
					process.kill(ptyProcess.pid,'SIGHUP');
				}
			}
			
		  });
	    
	});
}

