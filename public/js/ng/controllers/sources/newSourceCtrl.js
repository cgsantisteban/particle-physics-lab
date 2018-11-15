"use strict"

lab.controller('NewSourceCtrl',function($rootScope, $scope, modelSourceService, validate, utilities, $uibModalInstance, sourceId){
	
	let sourceList = modelSourceService.getParticleList(),
		sourceType = Object.keys(sourceList),
		particles = sourceList.particles,
		particleTypeList = Object.keys(particles),
		isotopes = angular.copy(sourceList.isotopes),
		gamosIsotopes = angular.copy(sourceList['GAMOS isotopes']),
		distributionList = angular.copy(modelSourceService.getDistributionList()),
		pythiaData = angular.copy(modelSourceService.getPythiaData());
	
	
	
	
	$scope.volumeList = _.filter($rootScope.experiment.geometry.volumeList,(v)=>{
		return !v.isWorld;
	});
	
	$scope.volumeList = _.map($scope.volumeList,'name');
	
	$scope.sourceType = sourceType;
	$scope.particleTypeList = particleTypeList; 
	$scope.particles = particles;
	$scope.isotopes = isotopes;
	$scope.gamosIsotopes = gamosIsotopes;
	
	$scope.distributionList = distributionList;
	
	if(sourceId<0)	$scope.windowTitle = 'New source';
	else $scope.windowTitle = 'Edit source';	

	if(sourceId<0) { //new source 
		$scope.source = {};
		$scope.source.name = utilities.generateName($scope.experiment.sourceList,'source');
		$scope.source.type = sourceType[0];
		$scope.source.particleType = particleTypeList[0];
		$scope.source.particle = particles.others[0];
		
		$scope.source.distributions = {};
		for(let i=0;i<$scope.distributionList.length;i++){
			let key = $scope.distributionList[i].distributionType;
			$scope.source.distributions[key] = $scope.distributionList[i].distributions[0];
		}
		
	} else{ //edit source
		$scope.source = angular.copy($scope.experiment.sourceList[sourceId]);
		if($scope.source.type === 'GAMOS isotopes'){
			for(let i=0;i<$scope.distributionList.length;i++){
				let key = $scope.distributionList[i].distributionType;
				if(key !== 'Position') $scope.source.distributions[key] = $scope.distributionList[i].distributions[0];
			}
		}
	}
	
	
	$scope.setDefaultVolume = function(source,volumeList){
		if(source.distributions['Position'].type === 'Volume' || source.distributions['Position'].type === 'Volume surface'){
			
			if(source.distributions['Position'].parameters['volume'].value == ''){
				source.distributions['Position'].parameters['volume'].value = volumeList[0];
				
			}
		}
	}
	
	
	$scope.setSourceType = function(sourceType){
		if(sourceType === $scope.sourceType[0]){
			$scope.source.particleType = particleTypeList[0];
			$scope.source.particle = particles.others[0];
		}
		if(sourceType === $scope.sourceType[1]){
			if(typeof $scope.source.particleType != 'undefined')  delete $scope.source.particleType;
			$scope.source.particle = isotopes[0];
			
		}
		if(sourceType === $scope.sourceType[2]){
			if(typeof $scope.source.particleType != 'undefined') delete $scope.source.particleType;
			$scope.source.particle = gamosIsotopes[0];
		}
		
	}
	
	$scope.setParticle = function(particleType){
		$scope.source.particle = particles[particleType][0];
	}
	
	$scope.isGAMOSIso = function(sourceType,distributionType){ //only position dist for GAMOS isotope
		let isValid;
		
		if(sourceType === 'GAMOS isotopes'  && distributionType === 'Position') isValid = true;
		else if(sourceType !== 'GAMOS isotopes') isValid = true;
		else isValid = false;
		
		return isValid;
	}
	
	//validations ---------
  	$scope.isValidSource = {};
	$scope.$watch('source', (newSource,oldSource)=>{
		
		$scope.isValidAllSource = true;
		$scope.isValidName = validate.validateName($scope.experiment.sourceList, newSource.name,sourceId, $rootScope.maxLength);
		$scope.isValidSource = validate.validateSource(newSource);
		for(let d in $scope.isValidSource.isValidDistribution.errorDist){
			for(let e in $scope.isValidSource.isValidDistribution.errorDist[d]){
				$scope.isValidAllSource = $scope.isValidAllSource && $scope.isValidName.isValid && 
										$scope.isValidSource.isValidDistribution.errorDist[d][e];
			}
		}
		
		if(newSource.type === 'isotopes'){
			for(let param in $scope.isValidSource.isValidIsotope.errorIsotope){
				$scope.isValidAllSource = $scope.isValidAllSource && $scope.isValidSource.isValidIsotope.errorIsotope[param];
			}
		}
		
		if(newSource.type === 'GAMOS isotopes'){
			
			for(let param in $scope.isValidSource.isValidGamosIsotope.errorGamosIsotope){
				$scope.isValidAllSource = $scope.isValidAllSource && $scope.isValidSource.isValidGamosIsotope.errorGamosIsotope[param]
			}
		}
		
		
				
		
		
	},true);
	//end validations -----------
	
	$scope.addSource = function() {
		if($scope.source.type === 'GAMOS isotopes'){
			for(let i=0;i<$scope.distributionList.length;i++){
				let key = $scope.distributionList[i].distributionType;
				if(key !== 'Position') $scope.source.distributions[key] = null; 
			}
		}
		
		$uibModalInstance.close($scope.source);
	};
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
});
