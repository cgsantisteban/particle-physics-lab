'use strict';

const fs = require('fs');
const _ = require('lodash');

let histoModule = require('../server/GAMOS/js/histoParser'),
	parserOutGAMOS = require('../server/GAMOS/js/parserOutGAMOS');
 

function runCmd (ptyProcess,cmd,argv,socket,expJSON,homeExp,initConsole){
	
	let buff = [];
	let fullCmd = cmd;
	if(argv != null ){
		for(let i=0;i<argv.length;i++){
			fullCmd += ' ' + argv[i];
		}
	}
	
	let shellCommand = '/control/shell'
	if(!_.includes(cmd,shellCommand)){
		ptyProcess.write(fullCmd +'\r');
	}
	
	
	let isHeader = false;
	let isData = false;
	let startErrorString = 'G4Exception-START'; //<--- bad code
	let endErrorString = 'G4Exception-END';
	let segmetationError = "*** Break *** segmentation violation";
	
	
	
	let execError = false,
		initError = false,
		endError = false,
		segError = false;
	
	
	
	ptyProcess.on('data', function(data) {
	
	 if(_.includes(data,segmetationError)){
		 execError = true;
		 segError = true;
		
	 }
	 
	 if(_.includes(data,startErrorString)){
		 execError = true;
		 initError = true;
		 
	 }
	  
	 if(execError){
		
		 if(segError){
			 let error = {
					type: 'segmetation',
					errorData: segmetationError
			}
			socket.emit('exp:ErrorConsole',error);
		 }
		 
		 if(initError){
			 
				if(_.includes(data,endErrorString)){
					
					let errorFile = homeExp +'/gamos_error.log';
				       fs.stat(errorFile,(err,stat)=>{
				    	   if(err == null){
				    		   if(stat.size>0){
				    			   fs.readFile(errorFile,(err,errorData)=>{
				    				   if(err){
				    					   throw err;
				    				   }
				    				   let error = {
				    							type: 'segmetation',
				    							errorData: errorData.toString()
				    					}
				    				   socket.emit('exp:ErrorConsole',error);
				    				   //initError = false;
				    			   });
				    		   }
				    	   }else{
				    		   console.error(err);
				    	   }
				       }); 
				 }
			  }
		  
	 } 
	 else{
		 if(cmd === 'gamos'){
			  if(data.indexOf('*****')>=0){
				  isHeader = true;
			  } 
			  if(isHeader){
				  socket.emit('exp:OutConsole', data);
			  }
			
		  }
	 }
	
	});

}

module.exports = {
	runCmd: runCmd
};
