"use strict"

lab.controller('DelExperimentCtrl', function ($scope, $rootScope, ExperimentListService, initExperiment, $uibModalInstance, experiment) {
	$scope.expDel = experiment;
	$scope.delExperiment = function(id){
		let ok = false;
		if( typeof id != 'undefined' && typeof $rootScope.experiment != 'undefined'){
			if(id === $rootScope.experiment._id){
				$rootScope.experiment = initExperiment.getExperiment();
				let initValues = angular.copy(initExperiment.initGlobal());
				$rootScope.isValidAll = initValues.isValidAll;
				$rootScope.isValidExperiment = initValues.isValidExperiment;
				$rootScope.isSaved = false;
			}
			
			ExperimentListService.delExperiment(id)
				.then((experimentList)=> {
					$rootScope.experimentList = experimentList.data;
					
				},(error)=>{
					console.error(data);
				});
				
				
			ok = true;
		}
		else{
			console.log('The experiment has not been deleted');
		}
		
		$uibModalInstance.close(ok);
	}
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss('Cancel');
	};
	
});
