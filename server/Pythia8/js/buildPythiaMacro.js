"use strict";

exports.buildPythiaMacro = function(pythiaBeam,processList,nEvent){
	
	var commandList = [];
	
	//Main:numberOfEvents = 1000
	var nEventString = 'Main:numberOfEvents = ' + nEvent; 
	commandList.push(nEventString);
	var nEach = parseInt(nEvent / 10);
	if (nEach <1) nEach = 1;
	var nextString = 'Next:numberCount = ' + nEach;
	commandList.push(nextString);
	//Beam
	var beamA = pythiaBeam.beamA,
		beamB = pythiaBeam.beamB;
	
	var idA = beamA,
		idB = beamB,
		commandIdA = 'Beams:idA = ' + idA,
		commandIdB = 'Beams:idB = ' + idB;
	commandList.push(commandIdA,commandIdB);
	
	if(pythiaBeam.energy.frame.option === 1){ //CM
		var eCM = pythiaBeam.energy.eCM,
			commandE = 'Beams:eCM = ' + eCM;
		commandList.push(commandE);
	}else if(pythiaBeam.energy.frame.option === 2){ //Back-to-back
		var eA = pythiaBeam.energy.eA,
			eB = pythiaBeam.energy.eB,
			commandFrame = 'Beams:frameType = 2', 
			commandEA = 'Beams:eA = ' + eA,
			commandEB = 'Beams:eB = ' + eB;
		
		commandList.push(commandFrame,commandEA,commandEB);
	}else{
		console.error('error: no defined frame');
	}
	
	//Process
	//HardQCD:all = on              
	//PromptPhoton:all = on
	for(var i=0;i<processList.length;i++){
		var process = processList[i];
		var command = process + ' = on';
		commandList.push(command);
	}
	
	return commandList;
}
