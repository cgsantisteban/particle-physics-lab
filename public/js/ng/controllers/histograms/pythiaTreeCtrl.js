'use strict';

lab.controller('PythiaTreeCtrl',function($rootScope,$scope,$location, modelPythiaService, modelSourceService,utilities){
	
	console.log('eventjson',$rootScope.histograms.pythiaTree);
	
	$scope.isViewData = true;
	
	var sourceList = modelSourceService.getParticleList();
	var particleList = sourceList.particles;
	
	$scope.pythiaStatus = modelPythiaService.getStatus();
	$scope.lgMargin = {top: 20, right: 0, bottom: 20, left: 20};
	
	var pythiaData;
	if(typeof $rootScope.experiment != 'undefined'){
		var beamA = $rootScope.experiment.pythiaData.pythiaBeam.beamA,
		beamB = $rootScope.experiment.pythiaData.pythiaBeam.beamB;
		$scope.textBeamA = utilities.getParticleName('pdg',beamA,particleList);
		$scope.textBeamB = utilities.getParticleName('pdg',beamB,particleList);
		var frame = $rootScope.experiment.pythiaData.pythiaBeam.energy.frame;
		var units = $rootScope.experiment.pythiaData.pythiaBeam.energy.units;
		
		if(frame.option === 1){
			var eCM = $rootScope.experiment.pythiaData.pythiaBeam.energy.eCM;
			$scope.textEnergy = '<b>Energy (' + frame.name + '): </b>' + eCM + ' ' + units ; 
		}
		else if(frame.option === 2){
			var eA = $rootScope.experiment.pythiaData.pythiaBeam.energy.eA,
				eB = $rootScope.experiment.pythiaData.pythiaBeam.energy.eB;
			$scope.textEnergy = '<b>Energy (A): </b>' + eA + ' ' + units + ', <b>Energy (B): </b>' + eB + ' ' + units; 
		}
		else{
			text = "Error: not defined pythia beam";
		}
	}
	else{
		console.error('undefined experiment');
		$location.url('/');
		return;
	}
	
});