"use strict"
 
lab.controller('PythiaHistogramCtrl', function($rootScope, $scope, $location,socket, genericService, validate, utilities){

	$scope.drawhistolist = []; 
	if(typeof $rootScope.histograms.pythiaHistograms != 'undefined'){
		$scope.drawhistolist.push($rootScope.histograms.pythiaHistograms[0]);
		$scope.selectedHistogram = $scope.drawhistolist[0];
	} 
	else{
		console.error('undefined histogram');
		$location.url('/');
		return;
	}
	 
	//Fit ----------
	var fitConfig = genericService.getFitConfig();
	var nPoints = fitConfig.nPoints;
	var outFitFile = fitConfig.outFitPythia;
	$scope.fitList = fitConfig.fitList;
	$scope.isfit = false;
	
	$scope.range = [];
	$scope.isValidRangeFit = [];
	
	$scope.fitFunc = $scope.fitList[0];
	$scope.funclist = [];
	$scope.rangeTotalFit = {
			minbinfit: $scope.drawhistolist[0].minX,
			maxbinfit: $scope.drawhistolist[0].maxX
	} 
	$scope.funcTotal = "";
	
	$scope.isValidGrade = {
			'isValid': true
	}
	$scope.initFunc = function(func){
		$scope.isValidGrade = {
				'isValid': true
		}
		if(func === 'polynomial'){
			this.grade = 1;
		} 
		
	}
	  
	$scope.validateGrade = function(grade){
		$scope.isValidGrade = validate.validateGrade(grade);
	}
	
	$scope.addFit = function(func,grade){
		if(func === 'polynomial') func = 'pol'+grade;
		$scope.funclist.push(func);
		$scope.funcTotal = utilities.getFuncTotal($scope.funclist);
		var isValid = [true,true];
		$scope.isValidRangeFit.push(isValid); 
		
	}
	
	$scope.newFit = function(){
		resetFit();
	}
	
	$scope.delFit = function(id){
		$scope.funclist.splice(id,1);
		$scope.range.splice(id,1);
		$scope.funcTotal = utilities.getFuncTotal($scope.funclist);
		
	}
	
	$scope.makeFit = function(){
		
		$scope.isfit = false;
		var	funcList = $scope.funclist,
			rangeFit = [$scope.rangeTotalFit.minbinfit,$scope.rangeTotalFit.maxbinfit];
		
		var range = [];
		for(var i=0;i<$scope.range.length;i++){
			var init = $scope.range[i][0],
			    end  = $scope.range[i][1]				
			range.push(init,end);
		}
		$scope.funcrange = range;
		
		if($scope.funclist.length === 1){
			rangeFit = range;
		}
		var pythiaROOTFile = $scope.drawhistolist[0].pythiaName,
			histogram = $scope.drawhistolist[0].pythiaDataName + ':' + $scope.drawhistolist[0].particleName;
		var fitData = {
				
				'outFitFile': outFitFile,
				'histogram': histogram,
				'nPoints': nPoints,
				'funcList': funcList,
				'range': range,
				'rangeFit': rangeFit,
				'actionName': pythiaROOTFile
		}
		
		socket.emit('exp:Fit', fitData);
		$scope.fitFunc = $scope.fitList[0];
		$scope.grade = 1;
		
	}
	
	function resetFit(){
		
		$scope.isfit = false;
		$scope.funclist = [];
		
		$scope.range = [];
		$scope.rangeTotalFit.minbinfit = $scope.xmin;
		$scope.rangeTotalFit.maxbinfit = $scope.xmax;
		
		$scope.isValidRangeFit = [];
		$scope.isValidRangeFuncTotal = {
				'min': true,
				'max': true
		};
		
		$scope.fitJSON = null;
		
	}
	
	$scope.fitJSON = null;
	socket.on('exp:outFit',function(data){
		$scope.isfit = true;
		$scope.fitJSON = JSON.parse(data);
		$scope.$digest();
	});	
	
	$scope.$watch('range',(newRange, oldRange)=>{
		var xminHisto = $scope.drawhistolist[0].minX,
			xmaxHisto = $scope.drawhistolist[0].maxX;
		//var 	histogramType = $scope.drawhistolist[0].histogramType;
		
		$scope.isValidRangeFit = [];
		$scope.isValidAllFunc = true; 
		newRange.forEach(function(r){
			var isValidRange = validate.validateRangeFit(r[0],r[1],xminHisto,xmaxHisto,null),
				isValid = [isValidRange.min,isValidRange.max];
			$scope.isValidRangeFit.push(isValid);
			$scope.isValidAllRange = true;
			$scope.isValidAllFunc = $scope.isValidAllFunc && isValid[0] && isValid[1];
		});
		
	},true);
	
	$scope.isValidRangeFuncTotal = {
			'min': true,
			'max': true
	}
	
	$scope.$watch('rangeTotalFit',function(newRangeTotal, oldRangeTotal){
		var xminHisto = $scope.drawhistolist[0].minX,
			xmaxHisto = $scope.drawhistolist[0].maxX,
			histogramType = $scope.drawhistolist[0].histogramType;
		
		var min = newRangeTotal.minbinfit,
			max = newRangeTotal.maxbinfit;
		
	},true);
	
});
