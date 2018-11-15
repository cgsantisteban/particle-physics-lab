"use strict";

lab.service('initDataService', function($http,$q){ 
   var initActionScorer = {};
   
    //gamos data, scorers, classifiers and filters
    var gamosDataList = $http.get("dataJSON/data/gamosplugin.json"),
    	scorerList = $http.get("dataJSON/data/scorers.json"),
    	classifierList = $http.get("dataJSON/data/classifiers.json"),
    	filterList = $http.get("dataJSON/data/filters.json"),
    	dataAnalysisList = $http.get("dataJSON/data/dataAnalysisList.json");
	
   
   var promise = $q.all([gamosDataList, scorerList, classifierList, filterList, dataAnalysisList]).then((data)=> {
			
		initActionScorer.actionList = data[0].data;
		initActionScorer.scorer = data[1].data;
		initActionScorer.classifierList = data[2].data;
		initActionScorer.filterList = data[3].data,
		initActionScorer.dataAnalysisList = data[4].data;
		
	});
 	
    return {
      promise: promise,
      getInitActionScorer: function () {
          return initActionScorer;
      }
    };
});
