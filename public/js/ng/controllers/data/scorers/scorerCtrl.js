"use strict"

lab.controller('ScorerCtrl',function($rootScope,$scope, initDataService,utilities, buildMacro, $uibModal){
	
	$scope.isViewMacro = true;
	
	let initDataList = initDataService.getInitActionScorer();
	$scope.initScorerList = initDataList.scorerList;
	$scope.initClassifierList = initDataList.classifierList;
		
	$scope.addScorer = function (size,scorerId) {
		let modalScorer = $uibModal.open({
	      animation: true,
	      backdrop: false,
	      templateUrl: 'views/data/scorers/newScorerData.html',
	      controller: 'ScorerDataCtrl',
	      size: size,
	      resolve: {
	    	  scorerId: function(){
	    		return scorerId;
	    	  }
	      }
	    });

	    modalScorer.result.then(function (scorer) {
	    	 
		      if(scorerId<0) $rootScope.experiment.data.scorerList.push(scorer);
		      else $rootScope.experiment.data.scorerList[scorerId] = scorer;
		      $rootScope.isSaved = false;
		    
		    }, function (cancel) {
		      console.log(cancel);
	      
	    });
	 }; 
	 
	$scope.getElementList = utilities.getElementList;
	$scope.delElement = utilities.delElement;
	$scope.addElement = utilities.addElement;
	
	$scope.delScorer = function(scorerId){
		$rootScope.experiment.data.scorerList.splice(scorerId,1);
	}
	
	
	$scope.$watch('experiment.data.scorerList',function(newScorerList,oldScorerList){
		
		$scope.commandList = buildMacro.buildScorers(newScorerList, $rootScope.experiment.geometry.volumeList);
		
		$rootScope.isSaved = false;
	},true);
	
});
