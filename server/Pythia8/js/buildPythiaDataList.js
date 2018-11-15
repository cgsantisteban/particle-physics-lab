"use strict";

exports.buildPythiaDataList = function(pythiaHistograms){
	
	var commandList = [];
	//pT,"transverse momentum",Z0,23,20,0,100,GeV/c
	for(var i=0;i<pythiaHistograms.length;i++){
		var data = pythiaHistograms[i].data.pythiaName,
			dataName = pythiaHistograms[i].data.name,
			particleName = pythiaHistograms[i].particle.particleName,
			pdg = pythiaHistograms[i].particle.pdg,
			nBins = pythiaHistograms[i].data.nbins,
			min = pythiaHistograms[i].data.limits[0],
			max = pythiaHistograms[i].data.limits[1],
			units = pythiaHistograms[i].data.units;
		
		var command =  data + ',' + dataName + ',' + particleName +',' + pdg + ',' + 
					   nBins + ',' + min + ',' + max + ',' + units;
		
		commandList.push(command);
	}
	
	return commandList;
	
}

