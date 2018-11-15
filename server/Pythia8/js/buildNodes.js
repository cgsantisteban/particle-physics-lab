"use strict";

const fs = require('fs');

exports.buildNodes = function(eventFile,socket){
	fs.readFile(eventFile,function(err,data){
		var pythiaTree = {};
		if(err){
	 		var error = {
					'file': eventFile,
					'description': err
				};
			socket.emit('error:File',error);
	 		console.error(err);
	 	}
		
		var lines = data.toString().split('\n');
		var nodes = [],
			links = [];
		for(var i=2;i<lines.length;i++){
			if(lines[i].length>0){
				//event,id,particle,status,mother1,mother2,daughter1,daughter2,colour,acolour,px,py,pz,e,m
				var tokens = lines[i].split(',');
				var nEvent = Number(tokens[0]),
					idParticle = Number(tokens[1]),
					name = tokens[2],
					status = Number(tokens[3]),
					mothers = [Number(tokens[4]),Number(tokens[5])],
					daughters = [Number(tokens[6]),Number(tokens[7])],
					colour = Number(tokens[8]),
					acolour = Number(tokens[9]),
					p = [Number(tokens[10]),Number(tokens[11]),Number(tokens[12])],
					e = Number(tokens[13]),
					m = Number(tokens[14]);
				
				var node = {
						"nEvent": nEvent, 
						"idParticle": idParticle,
						"name": name,
						"status": status,
						"mothers": mothers,
						"daughters": daughters,
						"colour": colour,
						"acolour": acolour,
						"p": p,
						"e": e,
						"m": m
					}
				nodes.push(node);
				
				var bd = true;
				if(status>0) var bd = false; //particle is allowed to branch or decay 
				
				for(var ii=0;ii<2;ii++){
					if(mothers[ii] !== 0) {
						var link = {
								"source": mothers[ii]-1,
								"target": nEvent-1,
								"bd": bd
						}
						links.push(link);
					}
					if(daughters[ii] !== 0) {
						var link = {
								"source": nEvent-1,
								"target": daughters[ii]-1,
								"bd": bd
						}
						links.push(link);
					}
				}
				
			}
			
		}
		
		pythiaTree = {
				"nodes": nodes,
				"links": links
		}
		
		var pythiaTreeString = JSON.stringify(pythiaTree);
		socket.emit("exp:pythiaTree",pythiaTree);
	});
	
}



