"use strict"

lab.controller('DataCtrl',function($scope, $location){
	if($location.search().tab == 'scorers') $scope.active = 1;
	else if($location.search().tab == 'filters') $scope.active = 2;
	else $scope.active = 0;
	
});
