"use strict"

lab.controller('FilterDataCtrl',function($rootScope, $scope, initDataService, modelSourceService, genericService, utilities, validate, $uibModalInstance, filterId){

	//init data
	let initDataList = initDataService.getInitActionScorer();
	let initPhysicsList = genericService.getInitPhysicsList();
	let sourceList = modelSourceService.getParticleList();
	
	if(filterId<0) $scope.windowTitle = 'New filter';
	else $scope.windowTitle = 'Edit filter';
	
	$scope.initFilterList = angular.copy(initDataList.filterList);
	
	let filterTypeMap = _.map($scope.initFilterList,'type');
	$scope.filterTypeList = _.uniq(filterTypeMap);
	
	
	$scope.filterID = filterId;
	$scope.subtypeList = [];
	$scope.parameters = [];
	if(filterId < 0){
		$scope.filterType = $scope.filterTypeList[0];
		$scope.myFilter = _.find($scope.initFilterList,function(f){
			return f.type = $scope.filterType;
		});
		$scope.filterName = utilities.generateName($rootScope.experiment.data.filterList,'filter');
		$scope.myFilter.name = $scope.filterName;
		
	}
	else{
		
		$scope.myFilter = angular.copy($rootScope.experiment.data.filterList[filterId]);
		$scope.filterName = $scope.myFilter.name;
		$scope.filterType = $scope.myFilter.type;
		
	}
	
	$scope.setFilter = function(filterType){
		$scope.myFilter = _.find($scope.initFilterList,function(f){
			return filterType === f.type;
		});
	}
	
	$scope.getOptions = function(paramType){
		let options = [];
		if(paramType === 'selectParticle'){
			let particles = sourceList.particles;
			
			for(let key in particles){
				options = options.concat(particles[key]);
			}
		}
		
		if(paramType === 'selectProcess'){
			let physicsLib = _.find(initPhysicsList.physicsList,function(physics){
				return physics.lib === $rootScope.experiment.physicsLib;
			});
			
			if(typeof physicsLib != 'undefined') options = physicsLib.processList;
			
		}
		
		if(paramType === 'selectFlux'){
			
			options = $rootScope.experiment.geometry.volumeList;
			
		}
		
		return options;
	}
	 
	$scope.isValidAll = true;
	$scope.isValidFilter = {};
	$scope.$watch('filterName',function(newName,oldName){
		$scope.isValidFilter.name = validate.validateName($rootScope.experiment.data.filterList, 
								newName,filterId, $rootScope.maxLength);
		$scope.isValidAll = true;
		if(typeof $scope.isValidFilter.parameters != 'undefined'){
			for(let i=0;i<$scope.isValidFilter.parameters.length;i++){
				let isValidParam = $scope.isValidFilter.parameters[i].isValid;
				$scope.isValidAll = $scope.isValidAll && isValidParam;
			}
			$scope.isValidAll = $scope.isValidAll && $scope.isValidFilter.name.isValid;
		}
		else{
			$scope.isValidAll = $scope.isValidAll && $scope.isValidFilter.name.isValid;
		}
		
	},true);
	
	$scope.$watch('myFilter.parameters',function(newParameters,oldParameters){
		
		
								
		let isValidParameters = [];
		isValidParameters = validate.validateParamFilter(newParameters);
		$scope.isValidFilter.parameters = isValidParameters;
		$scope.isValidAll = true;
		for(let i=0;i<$scope.isValidFilter.parameters.length;i++){
			let isValidParam = $scope.isValidFilter.parameters[i].isValid;
			$scope.isValidAll = $scope.isValidAll && isValidParam;
		}
		$scope.isValidAll = $scope.isValidAll && $scope.isValidFilter.name.isValid;
		
	},true);
	
	
	$scope.addFilter = function() {
		$scope.myFilter.name = $scope.filterName;
	    $uibModalInstance.close($scope.myFilter);
	};
	
	$scope.cancel = function(){
		$scope.errorFilter = 'filter cancelado'
		$uibModalInstance.dismiss($scope.errorFilter);
	};
	
});
