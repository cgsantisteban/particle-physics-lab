"use strict";

lab.service('ExperimentListService', function($http) { 
  
   var getExperimentList = function(){
   		return $http.get('/db/experiments');
   }
  
   var saveExperiment = function(experiment){
   		return $http({
			      url: '/db/experiments',
			      method: "POST",
			      params: {experiment: experiment}
			  })
   }
    
   var delExperiment = function(id){
   		return $http.delete('/db/' + id)

			
   }
  
   return {
      getExperimentList: getExperimentList,
      saveExperiment: saveExperiment,
      delExperiment: delExperiment
    };
});
