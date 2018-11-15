"use strict"

lab.controller('ScorerHistogramCtrl', function($rootScope,$scope, $location, validate){
	
	$scope.title = 'Histogram scorer';
	$scope.graphTypeList = ['index','2D projection', '3D projection']; 
	
	if(typeof $rootScope.histograms.scorerHistograms[0] != 'undefined' && $rootScope.histograms.scorerHistograms[0] !== null){
		$scope.selectedScorer = $rootScope.histograms.scorerHistograms[0];
	}
	else {
		$location.url('/');
		return;
	}
	
	$scope.isClassifier = $scope.selectedScorer.isClassifier; //<-- only index, no 2D  3D
	$scope.scorerVolume = _.find($rootScope.experiment.geometry.volumeList,function(v){
			return (v.name === $scope.selectedScorer.volume);
	});
	
	
	if(typeof $scope.scorerVolume.parameterisation != 'undefined'){
		$scope.isPhantom = ($scope.scorerVolume.parameterisation.type === 'PHANTOM');
	}
	else {
		$scope.isPhantom = false;
	}
	
	$scope.$watch('selectedScorer',(newScorer,oldScorer)=>{
		$scope.scorerVolume = _.find($rootScope.experiment.geometry.volumeList,function(v){ 
			return v.name === newScorer.volume;
		});
		
		if(typeof $scope.scorerVolume != 'undefined' && $scope.scorerVolume.isParam){
			$scope.isPhantom = ($scope.scorerVolume.parameterisation.type === 'PHANTOM');
		}
	
		$scope.graphType = $scope.graphTypeList[0]; 
		$scope.layer = 1;
		if($scope.isPhantom){
			let dimUnits = $scope.scorerVolume.solid.dimensions['Length X'].units; 
			let ratioLayer = ($scope.scorerVolume.solid.dimensions["Length Z"].value / $scope.scorerVolume.parameterisation.parameters["N copies Z"].value).toFixed(2)
			$scope.dimLayer = ratioLayer + ' ' + dimUnits + ' per layer';
		}
		$scope.isClassifier = $scope.selectedScorer.isClassifier;  
	},true);
	
	$scope.isValidLayer = {isValid : true};
	$scope.$watch('layer',(newLayer,oldLayer)=>{
		
		if($scope.isPhantom){
			let nz = $scope.scorerVolume.parameterisation.parameters["N copies Z"].value;
			$scope.isValidLayer = validate.validateLayerScorer(newLayer,nz);	
		}
		
	},true);
	
});
