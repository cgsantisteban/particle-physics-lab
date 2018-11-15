"use strict";

const fs = require('fs');
const _ = require('lodash');

exports.parserOutPythia = function(out,socket){

	for(var i=0;i<out.length;i++){
		
		var line = out[i];
		if(_.includes(line, '%% EVENT')){
			var subLine = line.split(' '),
			    nEvent = subLine[2];
			socket.emit('exp:nPythiaEvent', nEvent);
		}
		else continue
	}
}