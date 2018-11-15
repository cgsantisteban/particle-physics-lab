"use strict"

lab.controller('LoadExperimentCtrl', function ($rootScope, $scope, $uibModalInstance, experiment, modelSourceService,utilities) {
	
	$scope.expLoad = experiment;
	
	let sourceList = modelSourceService.getParticleList();
	let particleList = sourceList.particles;
	$scope.getPythiaData = function(pythiaData){
		let text;
		
		let beamA = pythiaData.pythiaBeam.beamA,
			beamB = pythiaData.pythiaBeam.beamB;
		
		let pA = utilities.getParticleName('pdg',beamA,particleList),
			pB = utilities.getParticleName('pdg',beamB,particleList);
		
		text = '<p><b>Collision: </b>' + pA + ' + ' + pB +'</p>'; 
		
		let frame = pythiaData.pythiaBeam.energy.frame;
		let units = pythiaData.pythiaBeam.energy.units;
		if(frame.option === 1){
			let eCM = pythiaData.pythiaBeam.energy.eCM;
			text += '<p><b>Energy (' + frame.name + '): </b>' + eCM + ' ' + units + '</p>'; 
		}
		else if(frame.option === 2){
			let eA = pythiaData.pythiaBeam.energy.eA,
				eB = pythiaData.pythiaBeam.energy.eB;
			text += '<p><b>Energy (A): </b>' + eA + ' ' + units + ', <b>Energy (B): </b>' + eB + ' ' + units + '</p>'; 
		}
		else{
			text = "Error: not defined pythia beam";
		}
		return text;
	}
		
	$scope.loadExperiment = function(){
		let ok = false;
		if(typeof experiment._id != 'undefined'){
			
			$uibModalInstance.close(experiment);
			
		}else{
			console.error("Error: undefined experiment");
			let errorLoad = "Error: undefined experiment";
			$uibModalInstance.dismiss(errorLoad);
		}
		
	}
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel load');
	};
	
});
