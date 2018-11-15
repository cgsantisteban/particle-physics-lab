"use strict";

lab.controller('SourceCtrl',function($rootScope,$scope, $location, validate, utilities, errorListService,genericService, modelExperimentService,
										initGeomService,modelSourceService, buildMacro, buildGeom, $uibModal, $window){
	
	let errorMessageList = errorListService.getErrorList();
	
	
	//Saved changes
	$scope.isViewGeomCommand = true;
	$scope.isViewSourceCommand = true;
	$rootScope.$watch('experiment.sourceList',function(newSourceList,oldSourceList){
		$rootScope.isSaved = false;
		//source commands
		$scope.sourceCommands = [];
		if($rootScope.isValidExperiment.isValidSources){
			for(let i=0;i<newSourceList.length;i++){
				let commandSource = buildMacro.buildSource(newSourceList[i]);
				$scope.sourceCommands = $scope.sourceCommands.concat(commandSource);
				
			}
			
		}
	},true);
	
	let initGeomData = initGeomService.getInitGeom();
		
		 
	$scope.showDelSource = false;
	
	//--------------- Source ----------------------------//
	if(!$rootScope.experiment.isPythia){
		if($rootScope.experiment.sourceList.length<=0) $rootScope.isValidExperiment.isValidSources = false;
		else $rootScope.isValidExperiment.isValidSources = true;
	}
	
	 $scope.clearDelSource = function(){
	 	$scope.showDelSource = false;
	 	$scope.deletedSourceList = [];
	 }
	 
	$scope.addSource = function (size,sourceId) {
		$scope.sourceId = sourceId;
	    let modalSource = $uibModal.open({
	      animation: true,
	      backdrop: false,
	      templateUrl: 'views/sources/newSource.html',
	      controller: 'NewSourceCtrl',
	      size: size,
	      resolve: {
	    	  sourceId: function () {
	    		  return sourceId;
	    	  }
	      }
	    });

	    modalSource.result.then((source)=> {
		      $scope.source = source;
		      $scope.source.generatorType = $scope.selectedGenerator;
		      if($scope.sourceId < 0) {
		    	  $rootScope.experiment.sourceList.push(source);  
		      }
		      else {
		    	  $rootScope.experiment.sourceList[$scope.sourceId] = source;
		      }
		      
		      if($rootScope.experiment.sourceList.length<=0){
		    	  $rootScope.isValidExperiment.isValidSources = false; 
		      } 
		      else {
		    	  $rootScope.isValidExperiment.isValidSources = true;
		      }
		 
		    }, function (cancel) {
		    	
	      
	    	});
	 }; //addSource
	 
	$scope.delSource = function(sourceId){ //delete source
		if(sourceId>-1){
			$rootScope.experiment.sourceList.splice(sourceId,1);
		} 
		if($rootScope.experiment.sourceList.length<=0) {
			$rootScope.isValidExperiment.isValidSources = false;
		}
		else {
			$rootScope.isValidExperiment.isValidSources = true;
		}
	 }
	
	 
	 
});
