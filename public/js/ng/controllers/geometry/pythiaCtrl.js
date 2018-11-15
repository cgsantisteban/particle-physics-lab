"use strict"

lab.controller('PythiaCtrl',function($scope, modelSourceService, validate, $uibModalInstance, pythiaDataId){
	
	var sourceList = modelSourceService.getParticleList(),
		particles = sourceList.particles,
		particleTypeList = Object.keys(particles),
		pythiaData = angular.copy(modelSourceService.getPythiaData());
	
	$scope.pythiaData = pythiaData.data;
	
	if(pythiaDataId < 0) $scope.windowTitle = "New pythia data";
	else $scope.windowTitle = "Edit pythia data";
	
	$scope.allParticles = [];
	for(var particleType in particles){
		$scope.allParticles = $scope.allParticles.concat(particles[particleType]);
	}
	
	
	if(pythiaDataId<0){
		$scope.pythiaHistogram = {};
		$scope.pythiaHistogram.particle = $scope.allParticles[0];	
		$scope.pythiaHistogram.data = angular.copy(pythiaData.data.dataList[0]);
			
	}
	else{
		$scope.pythiaHistogram = $scope.experiment.pythiaData.pythiaHistograms[pythiaDataId];
	}
	$scope.addPythiaData = function(){
		$uibModalInstance.close($scope.pythiaHistogram);
	}
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
	
	//validations
	$scope.isValidHistogram = {};
	$scope.isValidHistogram = validate.validateHistogram($scope.pythiaHistogram.data);
	$scope.isValidAll = true;
	$scope.$watch('pythiaHistogram.data',(newData,oldData)=>{
			$scope.isValidHistogram = {};
			$scope.isValidHistogram = validate.validateHistogram(newData);
			$scope.isValidAll = $scope.isValidHistogram.isValidNbins.isValid && $scope.isValidHistogram.isValidLimit[0].isValid && 
												$scope.isValidHistogram.isValidLimit[1].isValid;
		
	},true);
});

