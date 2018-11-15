"use strict"

lab.controller('NewExperimentCtrl', function ($scope,$uibModalInstance) {
	
	$scope.ok = function() {
		$uibModalInstance.close(true);
	};
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss(false);
	};
	
});
