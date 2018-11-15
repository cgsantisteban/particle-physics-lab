"use strict"

lab.controller('SaveExperimentCtrl', function ($scope, $rootScope, ExperimentListService, validate, utilities, $uibModalInstance) {
	
	ExperimentListService.getExperimentList();
	
	if($rootScope.experiment.name === null){
		$scope.expName = utilities.generateName($rootScope.experimentList,'experiment');
	}
	else{
		$scope.expName = $rootScope.experiment.name;
	} 
	
	$scope.expDescription = null;
	
	$scope.$watch('[expName,expDescription]',(newValues,oldValues)=>{
		let name = newValues[0],
			description = newValues[1];
			
		$scope.isValidName = validate.validateName($rootScope.experimentList,name,-1, -1,  'experimentName');
		$scope.maxLength = 150; 
		$scope.isValidDescription = validate.validateText(description, $scope.maxLength);
		if($scope.isValidDescription.isValid && $scope.expDescription !== null ){
			$scope.textLeft = $scope.maxLength - description.length; 
		} 
	});
	
	$scope.saveExperiment = function(name,description){
		let id = $rootScope.experiment._id;
		if( typeof id == 'undefined'){
			let date = Date.now();
			$rootScope.experiment.name = name;
			$rootScope.experiment.description = description; 
			$rootScope.experiment.date = date;
			ExperimentListService.saveExperiment($rootScope.experiment)
					.then((data)=> {
						$rootScope.experiment = data.data.experiment;
					  	//$rootScope.experiment.folder = folder;
					  	$rootScope.experimentList = data.data.experimentList;
					  },(error)=>{
						  console.error(error);
					 });
			
		}
		
		$uibModalInstance.close($rootScope.experiment);
		
	}
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
	
});
