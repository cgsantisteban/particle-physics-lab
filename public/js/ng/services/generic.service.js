"use strict";

lab.service('genericService', function($http,$q) { 
   var initPhysicsList = {},
    	initHelp = [],
    	eventGeneratorList = [],
    	fitConfig = {};
    	
    //physicsList
    var physicsList = $http.get("dataJSON/physicsList.json");
    
    //event generator
    var eventGenerator = $http.get("dataJSON/sources/eventGenerator.json");
    
    //help files
    var helpDescription = $http.get("dataJSON/help/help.json");
    
    //fit
    var fit = $http.get("dataJSON/fitConfig.json");
    
    
    
    
	var promise = $q.all([physicsList, eventGenerator, helpDescription, fit]).then(function(data) {
			
		initPhysicsList.physicsList = data[0].data;
		eventGeneratorList = data[1].data;
		initHelp = data[2].data;
		fitConfig = data[3].data;
	
		
	});
  
    return {
      promise: promise,
      getInitPhysicsList: function () {
          return initPhysicsList;
      },
      getEventGeneratorList: function(){
    	 return eventGeneratorList; 
      },
      getHelp: function () {
      	return initHelp;
      },
      getFitConfig: function () {
        	return fitConfig;
        }
    };
});
