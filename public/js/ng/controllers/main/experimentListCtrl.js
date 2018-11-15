"use strict"

lab.controller('ExperimentListCtrl', function ($scope, $rootScope,socket, ExperimentListService, initExperiment, $location, $uibModal) {
	
	
	
	$scope.itemList = [5,10,20,'All'];
	$scope.nItem = $scope.itemList[0];
	$scope.itemsPerPage = $scope.itemList[0];
	$scope.currentPage = 1;
	
	$scope.sortType = 'name';
  	$scope.sortReverse  = false;
  	$scope.searchExp = '';
	
	$scope.setItemPerPage = function(nItem){
		if(nItem !== 'All') $scope.itemsPerPage = nItem;
		else{
			$scope.totalExperiments = $rootScope.experimentList.length;
			if(typeof $scope.totalExperiments != 'undefined' && $scope.totalExperiments != null)
				$scope.itemsPerPage = $scope.totalExperiments;
			else $scope.itemsPerPage = $scope.itemList[0];
		}
	}
		
	$scope.pageChanged = function() {
		var firstExp = ($scope.currentPage-1)*$scope.itemsPerPage,
			lastElement = firstExp + $scope.itemsPerPage;
		var expList = getExperimentList($rootScope.experimentList,$scope.sortReverse,$scope.sortType,$scope.searchExp,$scope.itemsPerPage);
		
		$scope.currentExperimentList = expList.slice(firstExp,lastElement);
	};
	
	$scope.$watch('[experimentList,itemsPerPage, sortReverse,sortType,searchExp]',(newValues,oldValues)=>{
		var experimentList = newValues[0],
			itemsPerPage = newValues[1],
			sortReverse = newValues[2],
			sortType = newValues[3],
			searchExp = newValues[4];
		
		var expList = getExperimentList(experimentList,sortReverse,sortType,searchExp,itemsPerPage);
		
		$scope.totalExperiments = expList.length;
		var firstExp = ($scope.currentPage-1)*itemsPerPage,
			lastElement = firstExp  + itemsPerPage;
		$scope.currentExperimentList = expList.slice(firstExp,lastElement);
		
	},true);
	
	
	function getExperimentList(experimentList, sortReverse,sortType, searchExp, itemsPerPage){
		
		var expList =[];
		var orderList = [];
		var sortOrder = 'asc';
		if(sortReverse) sortOrder = 'desc';
		
		if(typeof searchExp != 'undefined' && searchExp !== "" ){
			
			for(var i=0;i<experimentList.length;i++){
				var exp = experimentList[i];
				var isName = exp.name.includes(searchExp);
				var isDescription = false;
				if(typeof exp.description != 'undefined' && exp.description !== null){
					isDescription = exp.description.includes(searchExp);
				}
				
				if(isName || isDescription){
					expList.push(exp);
				}
			}
		}
		else expList =  experimentList;
		
		orderList = _.orderBy(expList,[sortType], [sortOrder]);
		
		return orderList;
		
	}
	
	
	$scope.loadExperiment = function(size, experiment){
		var modalLoad = $uibModal.open({
			      animation: true,
			      backdrop: false,
			      templateUrl: 'views/main/loadExperiment.html',
			      controller: 'LoadExperimentCtrl',
			      size: size,
			      resolve: {
			    	  experiment: function () {
			    		  return experiment;
			        }
			      }
			    });
		
			    modalLoad.result.then((experiment)=> {
			    	socket.emit('newExperiment', {});
			    	$rootScope.experiment = experiment;
			   		var histograms = initExperiment.getHistograms(); //init histograms
					$rootScope.histograms = angular.copy(histograms);
					$rootScope.experimentSummary = {};
					$rootScope.showSummary = false;
			   		$rootScope.isSaved = true;
			    	$location.url('/particlelab');
			    	
				},function (error) {
				    console.error(error);
			      
			    });
	}
	
	$scope.delExperiment = function(size,experiment){
		
		if(typeof experiment._id != 'undefined'){
			var modalDel = $uibModal.open({
			      animation: true,
			      backdrop: false,
			      templateUrl: 'views/main/delExperiment.html',
			      controller: 'DelExperimentCtrl',
			      size: size,
			      resolve: {
			    	  experiment: function () {
			    		  return experiment;
			        }
			      }
			    });
		
			    modalDel.result.then((ok)=> {
				    }, function (cancel) {
				      
			      
			    });
		}
	}
	
});