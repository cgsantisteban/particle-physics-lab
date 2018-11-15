"use strict";

const fs = require('fs');
const _ = require('lodash');

exports.parserOutGAMOS = function(out,socket,homeExp){
	
	var totalPartCount = [],
	    totalProcCount = [],
	    totalProcCreator = [];
	
	for(var i=0;i<out.length;i++){
			var line = out[i];
			socket.emit('exp:outDataSimulation',line);
			if(_.includes(line,'%% EVENT')){
				var subLine = line.split(' '),
				    nEvent = subLine[3];
				socket.emit('exp:nEvent', nEvent);
			}
			
			if(_.includes(line,'PART_COUNT:')){
				var subLine = line.split(' '),
					particle = subLine[1],
					count = subLine[3];
					
				var partCount = {
						particle: particle,
				    	count: count
						};
				socket.emit('exp:partCount', partCount);
			}
			
			if(_.includes(line,'PROC_COUNT')){
				var subLine = line.split(' '),
				    procCount = {
						particle: subLine[1],
				    	proc: subLine[3],
						count: subLine[5]
						};
				socket.emit('exp:procCount', procCount);
			}
			
			if(_.includes(line,'PROC_CREATOR_COUNT')){
				var subLine = line.split(' '),
				    procCreator = {
						particle: subLine[1],
				    	proc: subLine[3],
						count: subLine[5]
						};
				socket.emit('exp:procCreator', procCreator);
				totalProcCreator.push(procCreator);
			}
		
			var wrlJSON = {};
			wrlJSON.exists = false;
			if(_.includes(line,'Output VRML 2.0 file:')){
				var subLine = line.split(' ');
				var wrlFile = subLine[4];
				var urlWRL = homeExp + '/' + wrlFile;
				fs.stat(urlWRL, (err,stats)=>{
					if(err) console.error(err);
					else {
						if(stats.size >0 ){
							wrlJSON.file = wrlFile;
							socket.emit('exp:WRLFile',wrlJSON);
						}
					}
				});
				
			}
			
			if(_.includes(line,'User=')){
				var subLine = line.split(' ');
				var userTime = subLine[2].split('=')[1],
					realTime = subLine[3].split('=')[1];
				var simulationTime = {
										"userTime": userTime,
										"realTime": realTime
									} 
				socket.emit('exp:simulationTime',simulationTime);
			}
		} //for out

}


