"use strict"

lab.controller('ImportExperimentCtrl', function($scope, validateExpJSON, $uibModalInstance){
	
	$scope.isValidLoad = {};
	$scope.isValidFile = false;
	let reader = new FileReader();
	reader.onload = function () {
		$scope.isValidLoad = validateExpJSON.validateExperiment(reader.result);
		console.log($scope.isValidLoad);
		for(let k in $scope.isValidLoad.elementList){
				if(!$scope.isValidLoad.elementList[k]){
					$scope.isValidFile = false; 
					break;
				}
				else $scope.isValidFile = true;
		}
		if($scope.isValidFile){
			$scope.expLoad =JSON.parse(reader.result);
		} 
		
		$scope.$apply();
	}
	
	$scope.fileExpChanged = function (ele) {
			reader.readAsText(ele.files[0]);
	}
	
	$scope.importExperiment = function(expLoad){
		let experiment = expLoad;
		$uibModalInstance.close(experiment);
	}
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss();
	};
	
	
});



