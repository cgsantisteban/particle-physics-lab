"use strict"

var lab = angular.module('Lab', [
                                 'ngRoute',
                                 'ui.bootstrap',
                                 'ngSanitize',
                                 'angularScreenfull',
                                 'ngFileSaver',
                                 'angularTreeview'
                                ]);

lab.config(['$routeProvider', '$provide', function($routeProvider, $locationProvider,$q) {
	
	
	$routeProvider
		.when('/', {
			redirectTo: '/particlelab'
		})
		.when("/particlelab", {
			templateUrl : "views/main/particleLab.html",
			controller : "ParticleLabCtrl",
			resolve:{
				'GenericService':function(genericService){
      				return genericService.promise;
				},
	      		'InitGeomService':function(initGeomService){
      				return initGeomService.promise;
	      		},
      			'ErrorListService': function(errorListService){
      				return errorListService.promise;
      			} 
			}
		})
		.when("/experimentlist", {
			templateUrl : "views/main/experimentList.html",
			controller : "ExperimentListCtrl"
		})
		.when("/saveexperiment", {
			templateUrl : "views/main/saveExperiment.html",
			controller : "SaveExperimentCtrl"
		})
		.when("/geometry", {
			templateUrl : "views/geometry/geometry.html",
			controller : "GeometryCtrl",
			resolve:{
				'ModelSolidService':function(modelSolidService){
  					return modelSolidService.promise;
				},
				'ModelSourceService':function(modelSourceService){
      				return modelSourceService.promise;
      			}
			} 
		})
		.when("/sources", {
			templateUrl : "views/sources/sourceList.html",
			controller : "SourceCtrl",
			resolve:{
				'ModelSourceService':function(modelSourceService){
      				return modelSourceService.promise;
      			}
			} 
		})
		.when("/data", {
			templateUrl : "views/data/data.html",
			controller : "DataCtrl",
			resolve:{
				'InitDataService':function(initDataService){
	      				return initDataService.promise;
	      		} 
			}
		})
		.when("/console", {
			templateUrl : "views/main/console.html",
			controller: "ConsoleCtrl",
			resolve:{
				'GeantCommandsService':function(geantCommandsService){
      				return geantCommandsService.promise;
				} 
			}
		})
		.when("/summary", {
			templateUrl : "views/histograms/summary.html",
			controller : "SummaryCtrl"
		})
		.when("/gamosDataHistograms", {
			templateUrl : "views/histograms/gamosDataHistograms.html",
			controller : "ActionHistogramCtrl"
		})
		.when("/scorerHistograms", {
			templateUrl : "views/histograms/scorerHistograms.html",
			controller : "ScorerHistogramCtrl"
		})
		.when("/pythiaTree", {
			templateUrl : "views/histograms/pythiaTree.html",
			controller: "PythiaTreeCtrl",
			resolve:{
	      		'ModelPythiaService':function(modelPythiaService){
	      				return modelPythiaService.promise;
	      		}
			}
		})
		.when("/pythiaHistograms", {
			templateUrl : "views/histograms/pythiaHistograms.html",
			controller: "PythiaHistogramCtrl"
		})
		.when("/exportexp", {
			templateUrl : "views/main/exportExp.html"
		})
		.when("/getstarted", {
			templateUrl : "views/help/getstarted.html"
		})
		.when("/about", {
			templateUrl : "views/help/about.html"
		})
		.when("/getparticlelab", {
			templateUrl : "views/downloads/getparticlelab.html"
		})
		.when("/analysis", {
			templateUrl : "views/data/analysis/dataList.html",
			controller: "DataListCtrl"
		})
		.otherwise({
			redirectTo: '/particlelab'
		});
	
	
}]);

lab.run(function($rootScope, $location, socket, initExperiment,genericService, ExperimentListService, 
		beforeUnload,pageListService) {
	
	
	//global variables, initial values
	let initValues = angular.copy(initExperiment.initGlobal());
	$rootScope.isValidAll = initValues.isValidAll;
	$rootScope.isValidExperiment = initValues.isValidExperiment;
	$rootScope.isSaved = initValues.isSaved; 
	$rootScope.showSummary = initValues.showSummary;
	$rootScope.okRunExperiment = initValues.okRunExperiment;
	$rootScope.maxLength = initValues.maxLength; 
	$rootScope.termData = initValues.termData;
	$rootScope.isMongo = initValues.isMongo;
	
	$rootScope.macroText = null;
	$rootScope.geomText = null;
	
	//max. beams (max integer 64-bit:  2^53-1, 32-bit: 2^31-1)
	$rootScope.maxBeams = initValues.maxBeams;
	if($rootScope.maxBeams == null)	$rootScope.maxBeams = Number.MAX_SAFE_INTEGER;
	
	
	let histograms = initExperiment.getHistograms(); //init histograms
	$rootScope.histograms = angular.copy(histograms);
	
	
	//Mongo
	socket.on('exp:isMongo',(isMongo)=>{
		$rootScope.isMongo = isMongo;
		
		if($rootScope.isMongo){
			ExperimentListService.getExperimentList()
			.then((data)=>{
				$rootScope.experimentList = data.data;
				
			},(error)=>{
				console.log('Error: ', error);
			});
			
		}
	})
	//
	
	
	//reload page
	/*$rootScope.$on('onBeforeUnload', function (e, confirmation) {
	        confirmation.message = "All data willl be lost.";
	        e.preventDefault();
	    });
	
	$rootScope.$on('onUnload', function (e) {
		console.log(e);
	});*/

	
	$rootScope.$on( "$routeChangeStart", function(event, next, current) {
	      if ( typeof $rootScope.experiment == 'undefined'  || $rootScope.experiment === null) {
	          $location.path( "/particlelab" );
	      }         
	 }); 
	
	
});



