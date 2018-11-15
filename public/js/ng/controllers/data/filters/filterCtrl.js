"use strict"

lab.controller('FilterCtrl',function($rootScope,$scope, modelSourceService,utilities, buildMacro, $uibModal){
	
	$scope.isViewMacro = true;
	
	$scope.addFilter = function (size,filterId) {
		$scope.filterId = filterId;
	    let modalFilter = $uibModal.open({
	      animation: true,
	      backdrop: false,
	      templateUrl: 'views/data/filters/newFilter.html',
	      controller: 'FilterDataCtrl',
	      size: size,
	      resolve: {
	    	  filterId: function () {
	          return filterId;
	        }
	      }
	    });

	    modalFilter.result.then((filter)=> {
		      
		      if(filterId<0) $rootScope.experiment.data.filterList.push(filter);
		      else {
		      	//update actions and scorers
		      	let oldFilter = $rootScope.experiment.data.filterList[$scope.filterId],
		      		newFilter = filter;
		      		
		      	for(let i=0;i<$rootScope.experiment.data.actionList.length;i++){
		      		let pos = $rootScope.experiment.data.actionList[i].filterList.indexOf(oldFilter);
		      		
		      		if(pos>=0)
		      			$rootScope.experiment.data.actionList[i].filterList[pos] = newFilter;
		      	}
		      	
		      	for(let i=0;i<$rootScope.experiment.data.scorerList.length;i++){
		      		let pos = $rootScope.experiment.data.scorerList[i].filterList.indexOf(oldFilter);
		      		if(pos>=0)
		      			$rootScope.experiment.data.scorerList[i].filterList[pos] = newFilter;
		      	}
		      	
		      	//update filter
		      	$rootScope.experiment.data.filterList[filterId] = filter;
		      	
		      }
		    
		      $rootScope.isSaved = false;
		      
		    }, function (cancel) {
		      
	      
	    });
	 }; 
	 
	 $scope.delFilter = function(filterId){
		 let filter = $rootScope.experiment.data.filterList[filterId];
		 
		 for(let i=0;i<$rootScope.experiment.data.actionList.length;i++){
		 	 let pos = $rootScope.experiment.data.actionList[i].filterList.indexOf(filter);
			 if(pos>-1) $rootScope.experiment.data.actionList[i].filterList.splice(pos,1);
		 }
		 
		 for(let i=0;i<$rootScope.experiment.data.scorerList.length;i++){
			 let pos = $rootScope.experiment.data.scorerList[i].filterList.indexOf(filter);
			 if(pos>-1) $rootScope.experiment.data.scorerList[i].filterList.splice(pos,1);
		 } 
		 
		 $rootScope.experiment.data.filterList.splice(filterId,1);
		 $rootScope.isSaved = false;
	 }

	let sourceList = modelSourceService.getParticleList();
	$scope.particles = sourceList.particles;
	$scope.getParticleName = utilities.getParticleName;
	
	$rootScope.$watch('experiment.data.filterList',(newFilterList,oldFilterList)=>{
		
		let macroFilter = [];
		for(let i=0;i<newFilterList.length;i++){
			macroFilter.push('#'+newFilterList[i].name);
			let command= buildMacro.buildFilter(newFilterList[i]);
			macroFilter = macroFilter.concat(command);
		}
		
		$scope.commandList = macroFilter;
		
		
	},true)
	
	 
});
