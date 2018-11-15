"use strict"

lab.controller('ScorerDataCtrl',function($rootScope,$scope, initDataService, utilities, validate, errorListService, $uibModalInstance, scorerId){
	
	let errorMessageList = errorListService.getErrorList();
	
	if(scorerId<0) $scope.windowTitle = 'New scorer';
	else $scope.windowTitle = 'Edit scorer';
	
	$scope.volumeList = $rootScope.experiment.geometry.volumeList;
	
	let initDataList = initDataService.getInitActionScorer();
	$scope.scorerList = angular.copy(initDataList.scorer.scorerList);
	$scope.fluxTypeList = angular.copy(initDataList.scorer.fluxTypeList);
	$scope.fluxSurfaceList = angular.copy(initDataList.scorer.fluxSurfaceList);
	$scope.scorerId = scorerId;
	$scope.dataList = [];
	
	$scope.scorer = {}
	if(scorerId<0){
		
		$scope.scorer = {
					'name': utilities.generateName($rootScope.experiment.data.scorerList,'scorer'),
					'volume': $scope.volumeList[0].name,
					'classifierList': [],
					'filterList': []
		}
		$scope.typeList = getScorerTypeList($scope.scorerList, $scope.scorer.volume);
		$scope.scorerType = $scope.typeList[0];
		$scope.dataList = getDataList($scope.scorerType,$scope.scorerList);
		$scope.scorer.data = $scope.dataList[0];
		
	}
	else {
		$scope.scorer = angular.copy($rootScope.experiment.data.scorerList[scorerId]);
		$scope.typeList = getScorerTypeList($scope.scorerList, $scope.scorer.volume);
		$scope.scorerType = $scope.scorer.data.type;
		$scope.dataList = getDataList($scope.scorerType,$scope.scorerList);
	}
	
	$scope.setData = function(scorerType,scorerList, scorerId){
		$scope.dataList = getDataList(scorerType,scorerList);
		$scope.scorer.data = $scope.dataList[0];
		if($scope.scorer.data.gamosName === 'GmPSSurfaceFlux') {
			$scope.scorer.data.fluxType = $scope.fluxTypeList[0];
			$scope.scorer.data.surfaceList = [];
		}
		else{
			delete $scope.scorer.data.fluxType;
			delete $scope.scorer.data.surfaceList;
		}
	}
	
	$scope.getSurfaceList = function(volumeName,fluxSurfaceList){
		let volume = _.find($rootScope.experiment.geometry.volumeList,function(v){
			return v.name == volumeName;
		});
		let fluxSurface = {};
		if(typeof volume != 'undefined'){
				fluxSurface = _.find($scope.fluxSurfaceList,function(surface){
									return surface.solidType === volume.solid.solidType;
							 });	
		}
		
		return fluxSurface.surfaceList;
	}
	
	$scope.addSurface = function(surface,surfaceList){
		let pos = surfaceList.indexOf(surface);
		if(pos<0) surfaceList.push(surface);
		else surfaceList.splice(pos,1);
	}
	
	$scope.checkSurface = function(surface,surfaceList){
		let isSelected = true,
			pos = surfaceList.indexOf(surface);
		
		if(pos<0) isSelected = false;
		
		return isSelected;
		
	}
	
	$scope.changeVolume = function(scorerList,volume){
		$scope.typeList = getScorerTypeList(scorerList, volume);
		$scope.scorerType = $scope.typeList[0];
		$scope.dataList = getDataList($scope.scorerType,scorerList);
		$scope.scorer.data = $scope.dataList[0];
		if(typeof $scope.scorer.data.surfaceList != 'undefined') $scope.scorer.data.surfaceList = [];
	}
		
	function getScorerTypeList(scorerList, volumeName){
		let typeList = [];
		let volume = _.find($rootScope.experiment.geometry.volumeList,function(v){
			return v.name === volumeName;
		});
		
		for(let i=0;i<scorerList.length;i++){
			if(scorerList[i].gamosName === 'GmPSSurfaceFlux' && volume.solid.solidType === 'CONS') continue;
			else{
				if(typeList.indexOf(scorerList[i].type)<0) typeList.push(scorerList[i].type);	
			}
		}
		
		return typeList;
	}
	
	function getDataList(scorerType,scorerList){
		let dataList = [];
		for(let i=0;i<scorerList.length;i++){
			if(scorerType === scorerList[i].type) dataList.push(scorerList[i]);
		}
		
		return dataList;
	}
	
	//validations
	let isValidName =  {isValid: true},
		isValidSurface = {isValid: true};
	
	$scope.isValidAll = true;
	$scope.isValidScorer = {
			'isValidName': isValidName,
			'isValidSurface': isValidSurface
	}
	
	$scope.$watch('scorer',(newScorer,oldScorer)=>{
		let scorerName = newScorer.name;
		let isValidName = validate.validateName($rootScope.experiment.data.scorerList,scorerName,scorerId, $rootScope.maxLength);
		$scope.isValidScorer.isValidName = isValidName;
		
		if(newScorer.data.gamosName === 'GmPSSurfaceFlux'){
			$scope.isValidScorer.isValidSurface.isValid = (newScorer.data.surfaceList.length>0);
			if(!$scope.isValidScorer.isValidSurface.isValid) 
				$scope.isValidScorer.isValidSurface.errorMessages = errorMessageList['surfaceFlux'];
			else delete $scope.isValidScorer.isValidSurface.errorMessages;
		}else {
			$scope.isValidScorer.isValidSurface = {isValid: true};
		}
		$scope.isValidAll = true;
		for(let key in $scope.isValidScorer)
			$scope.isValidAll = $scope.isValidAll && $scope.isValidScorer[key].isValid; 
	},true)
	//end validations
	
	$scope.addScorer = function() {
	    $uibModalInstance.close($scope.scorer);
	};
	
	$scope.cancel = function(){
		$scope.errorScorer = 'scorer cancelado'
		$uibModalInstance.dismiss($scope.errorScorer);
	};
	
});
