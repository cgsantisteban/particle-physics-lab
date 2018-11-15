"use strict"

lab.controller('ActionDataCtrl',function($rootScope,$scope, initDataService, validate, modelSourceService, $uibModalInstance, actionType, actionId, dataId){
	
	let particleList = modelSourceService.getParticleList().particles;
	$scope.particles = [];
	for(let type in particleList){
		$scope.particles = $scope.particles.concat(particleList[type]);
	
	}
	
	//init data
	let initDataList = initDataService.getInitActionScorer(),
		actionList = initDataList.actionList,
		dataList = [];
	
	let actionSelected = _.find(actionList,function(a){
		return a.type === actionType;
		
	});
	
	if(typeof actionSelected != 'undefined') {
		dataList = angular.copy(actionSelected.dataList);
		$scope.dataList = angular.copy(dataList);
	}
	
	$scope.limitLabel = [['Min. X Axis','Max. X Axis'],['Min. Y Axis','Max. Y Axis']];
	$scope.dimensionList = ['1D','2D'];
	
	if(dataId<0) $scope.windowTitle = 'New GAMOS data';
	else $scope.windowTitle = 'Edit GAMOS data';	
	
	$scope.data = {};
	if(dataId<0){
		$scope.data = {
				'dimension': $scope.dimensionList[0],
				'data': [angular.copy(dataList[0])]
		}
		if(actionSelected.type === "Stack")
			$scope.data.data[0].particle = $scope.particles[1];
	}
	else{
		$scope.data = $rootScope.experiment.data.actionList[actionId].dataList[dataId];
	}
	
	$scope.setData = function(data){
		data.data = [];
		if(data.dimension === '1D'){
			
			data.data = [angular.copy(dataList[0])];
		}
		else{
			
			data.data = [angular.copy(dataList[0]),angular.copy(dataList[1])];
		}
	}
	
	//validations
	$scope.isValidHistogram = [];
	for(let i=0;i<$scope.data.length;i++){ //init validations
			$scope.isValidHistogram.push(validate.validateHistogram(data[i]));
	}
	$scope.$watch('data.data',(newData,oldData)=>{
			
		$scope.isValidHistogram = [];
		for(let i=0;i<newData.length;i++){
			$scope.isValidHistogram.push(validate.validateHistogram(newData[i]));
			
		}
		$scope.isValidAll = true;
		for(let i=0;i<$scope.isValidHistogram.length;i++){
			$scope.isValidAll = $scope.isValidAll && $scope.isValidHistogram[i].isValidNbins.isValid && 
								$scope.isValidHistogram[i].isValidLimit[0].isValid && 
								$scope.isValidHistogram[i].isValidLimit[1].isValid;
		}
		
	},true);
	//end validations
	
	$scope.addData = function() {
	    $uibModalInstance.close($scope.data);
	};
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel add data');
	};
	
});