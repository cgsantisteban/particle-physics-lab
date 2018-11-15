"use strict"

lab.controller('ActionHistogramCtrl',function($rootScope,$scope, $location, genericService, validate, utilities, socket){

	if(typeof $rootScope.histograms.actionHistograms[0] == 'undefined'){
		$location.url('/');
		return;
	}
	
	$scope.selectedAction = $rootScope.histograms.actionHistograms[0];
	$scope.dimList = getDimensionList($scope.selectedAction);
	$scope.dimension = $scope.dimList[0];
	
	let dataClassList = getDataTypeList($scope.selectedAction.actionName,$rootScope.histograms.actionHistograms,$scope.dimension);
	
	initHistogramList(dataClassList)
	 
	$scope.setDataClass = function(actionName,actionHistograms){
		if(typeof $scope.selectedAction != 'undefined' && $scope.selectedAction !== null){
			$scope.dimList =  getDimensionList($scope.selectedAction);
			$scope.dimension = $scope.dimList[0];
			let dataClassList = getDataTypeList(actionName,actionHistograms,$scope.dimension);
			initHistogramList(dataClassList);
		}
	}
	
	$scope.changeDimension = function(actionName,actionHistograms,dimension){
		let dataClassList = getDataTypeList(actionName,actionHistograms,dimension);
		initHistogramList(dataClassList);
	}
	
	$scope.findHisto = function(histolist,dataName,classifier,dimension){
		let find = false,
			pos = 0
		
		if(dimension === '1D'){
			while(!find && pos<histolist.length){
				if(typeof classifier != 'undefined'){
					if((histolist[pos].labelX === dataName) && (histolist[pos].dataClassifier === classifier) ) find = true;
					else pos++;
				}
				else{
					if(histolist[pos].labelX === dataName ) find = true;
					else pos++;
				}
				
			}
		}
		
		if(dimension === '2D'){
			let dataList = dataName.split('.vs.'),
				dataX = dataList[0],
				dataY = dataList[1];
			let find = false, pos = 0;
			while(!find && pos<histolist.length){
				if(typeof classifier != 'undefined'){
					if((histolist[pos].labelX === dataX) && (histolist[pos].labelY === dataY) && (histolist[pos].dataClassifier === classifier) ) find = true;
					else pos++;
				}
				else{
					if((histolist[pos].labelX === dataX) && (histolist[pos].labelY === dataY)) find = true;
					else pos++;
				}
				
			}
		}
		
		return pos;
	}
	
	$scope.setClassifier = function(selectedAction,dataName,actionHistograms,dimension,classifier){
		$scope.dataClassList = getDataTypeList(selectedAction.actionName,actionHistograms,dimension);
		let histogramList = getHistogramList(selectedAction,dimension);
		$scope.drawhistolist = [];
		
		if(dimension === '1D') classifier = $scope.dataClassList.classifierList[0];
		
		let posHisto = $scope.findHisto(histogramList,dataName,classifier,dimension);
		$scope.drawhistolist.push(histogramList[posHisto]);
		
		$scope.xmin = $scope.drawhistolist[0].minX;
		$scope.xmax = $scope.drawhistolist[0].maxX;
		
		if(dimension === '2D'){
			$scope.ymin = $scope.drawhistolist[0].minY;
			$scope.ymax = $scope.drawhistolist[0].maxY;
		}
		
		if($scope.drawhistolist[0].type === 'StackCounter') {
			$scope.nbins = $scope.drawhistolist[0].nbins;
			$scope.stepInput = 1;
		}else{
			$scope.nbins = $scope.drawhistolist[0].nbins;
			$scope.stepInput = ($scope.xmax-$scope.xmin)/10;
		}
		
		resetFit();
	}
	
	$scope.addHisto = function(drawhistolist,selectedAction,dataName,classifier,dimension){
		resetFit();
		let histoData = getHistogramList(selectedAction,dimension),
			posH = $scope.findHisto(drawhistolist,dataName,classifier,dimension);
		
		if(dimension === '1D'){
			if(posH>=$scope.drawhistolist.length){
				let find = false,
				pos = 0
				while(!find && pos<histoData.length){
					if((histoData[pos].labelX === dataName) && (histoData[pos].dataClassifier === classifier)) find = true;
					else pos++;
				}
				$scope.drawhistolist.push(histoData[pos]);
			}
			else {
				$scope.drawhistolist.splice(posH,1);
			}
		}
		
		if(dimension === '2D'){
			let dataList = dataName.split('.vs.'),
				dataX = dataList[0],
				dataY = dataList[1];
			
			if(posH>=$scope.drawhistolist.length){
				let find = false,
					pos = 0
				while(!find && pos<histoData.length){
					if((histoData[pos].labelX === dataX) && (histoData[pos].labelY === dataY) && (histoData[pos].dataClassifier === classifier)) find = true;
					else pos++;
				}
				$scope.drawhistolist.push(histoData[pos]);
			}
			else {
				$scope.drawhistolist.splice(posH,1);
			}
			
		}
	}
	
	//Fit ----------
	let fitConfig = genericService.getFitConfig();
	let nPoints = fitConfig.nPoints;
	$scope.fitList = fitConfig.fitList; 
	let outFitFile = fitConfig.outFitFile; 
	
	$scope.isfit = false;
	
	$scope.range = [];
	$scope.isValidRangeFit = [];
	
	$scope.fitFunc = $scope.fitList[0];
	$scope.funclist = [];
	$scope.rangeTotalFit = {
			minbinfit: $scope.drawhistolist[0].minX,
			maxbinfit: $scope.drawhistolist[0].maxX
	} 
	 
	$scope.funcTotal = ""; //total fit function
	
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
		let isValid = [true,true];
		$scope.isValidRangeFit.push(isValid); 
		
	}
	
	$scope.delFit = function(id){
		$scope.funclist.splice(id,1);
		$scope.range.splice(id,1);
		$scope.funcTotal = utilities.getFuncTotal($scope.funclist);
		
	}
	
	$scope.makeFit = function(){
		
		$scope.isfit = false;
		
		let	histogram = $scope.drawhistolist[0].histogram,
			funcList = $scope.funclist,
			rangeFit = [$scope.rangeTotalFit.minbinfit,$scope.rangeTotalFit.maxbinfit];
		
		let range = [];
		for(let i=0;i<$scope.range.length;i++){
			let init = $scope.range[i][0],
			    end  = $scope.range[i][1]				
			range.push(init,end);
		}
		$scope.funcrange = range;
		
		if($scope.funclist.length === 1){
			rangeFit = range;
		}
		let actionName = $scope.selectedAction.actionName;
		let fitData = {
				
				'outFitFile': outFitFile,
				'histogram': histogram,
				'nPoints': nPoints,
				'funcList': funcList,
				'range': range,
				'rangeFit': rangeFit,
				'actionName': actionName
		}
		
		socket.emit('exp:Fit', fitData);
		
		this.fitFunc = this.fitList[0];
	}
	 
	$scope.newFit = function(){
		resetFit();
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
	socket.on('exp:outFit',(data)=>{
		$scope.isfit = true;
		$scope.fitJSON = JSON.parse(data); 
		$scope.$digest();
	});	
	
	$scope.getUnits = function(funcList, histoUnits){ //<-- review code
		let totalUnits = [];
		for(let i=0; i<funcList.length;i++){
			let f =  funcList[i].charAt(0);
			let units = [];
			if(f === 'e'){
				units[0] =  '';
				units[1] = histoUnits + '<sup>-1</sup>';
				
			}
			
			if(f === 'g'){
				units[0] = '';
				units[1] = histoUnits;
				units[2] = histoUnits;
 			}
			
			if(f === 'p'){
				let grade = Number(funcList[i].slice(3));
				units[0] = '';
				for(let ii=1; ii<=grade;ii++){
					units[ii] = histoList[ii] + '<sup>-' + ii + '</sup>';    
				}
			}
			
			totalUnits.push(units);
		}
		
		return totalUnits;
	}
	
	$scope.$watch('range',(newRange, oldRange)=>{
		
		let xminHisto = $scope.drawhistolist[0].minX,
			xmaxHisto = $scope.drawhistolist[0].maxX,
			histogramType = $scope.drawhistolist[0].histogramType;
		$scope.isValidRangeFit = [];
		$scope.isValidAllFunc = true; 
		newRange.forEach(function(r){
			let isValidRange = validate.validateRangeFit(r[0],r[1],xminHisto,xmaxHisto,histogramType),
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
	$scope.$watch('rangeTotalFit',(newRangeTotal, oldRangeTotal)=>{
		let xminHisto = $scope.drawhistolist[0].minX,
			xmaxHisto = $scope.drawhistolist[0].maxX,
			histogramType = $scope.drawhistolist[0].histogramType;
		
		let min = newRangeTotal.minbinfit,
			max = newRangeTotal.maxbinfit;
		
		$scope.isValidRangeFuncTotal = validate.validateRangeFit(min,max,xminHisto,xmaxHisto,histogramType);
		
	},true);
	
	//end fit -----------
	
	function initHistogramList(dataClassList){
		if(typeof dataClassList != 'undefined') {
			
			if($scope.isfit) {
				resetFit();
				$scope.isfit = false;
			} 
			
			$scope.dataClassList = dataClassList;
			$scope.selectedData = $scope.dataClassList.dataTypeList[0];
			
			//draw histogram
			let histogramList = getHistogramList($scope.selectedAction,$scope.dimension);
			$scope.drawhistolist = [];
			$scope.drawhistolist.push(histogramList[0]);
			$scope.xmin = $scope.drawhistolist[0].minX;
			$scope.xmax = $scope.drawhistolist[0].maxX;
			$scope.nbins = $scope.drawhistolist[0].nbins;

			if($scope.drawhistolist[0].type === 'stackCounter') {
				$scope.stepInput = 1;
			}else{
				
				$scope.stepInputX = ($scope.xmax-$scope.xmin)/10;
			}
			
			if($scope.drawhistolist[0].dimension === '2D') {
				$scope.classifier2D = dataClassList.classifierList[0];
				$scope.ymin = $scope.drawhistolist[0].minY;
				$scope.ymax = $scope.drawhistolist[0].maxY;
				$scope.stepInputY = ($scope.ymax-$scope.ymin)/10;
				
			}
	
		}
	}
	
	function getDimensionList(action){
		let dimList = []
		action.histogramList.forEach(function(histo) {
		    if(dimList.indexOf(histo.dimension)<0) dimList.push(histo.dimension);
		});
		return dimList;
	} 
	
	//data type list
	function getDataTypeList(actionName,actionHistograms,dimension){
		let actionData = _.find(actionHistograms,(a)=>{
			return a.actionName === actionName; 
		});
		
		let dataTypeList = [],
			classifierList = [];
		if(typeof actionData != 'undefined'){
			let histogramList = getHistogramList(actionData,dimension);
			histogramList.forEach((histogram)=>{
				let classifierName; 
				if(dimension === histogram.dimension){
					if(dimension === '1D' ){
						let dataName = histogram.labelX; 
						if(dataTypeList.indexOf(dataName)<0) dataTypeList.push(dataName);
					}
					
					if(dimension === '2D'){
						let dataName = histogram.labelX + '.vs.' + histogram.labelY; 
						if(dataTypeList.indexOf(dataName)<0) dataTypeList.push(dataName);
					}
					
					classifierName = histogram.dataClassifier;
				}
	
				if(classifierList.indexOf(classifierName)<0 && classifierName !== null) classifierList.push(classifierName);
			});
			
		}
		let dataClassList = {
			'dataTypeList': dataTypeList,
			'classifierList': classifierList
		}
	
		return dataClassList;
	}
	
	// dimension histogram list
	function getHistogramList(action,dimension){
		let histoList = [];
		action.histogramList.forEach(function(histo){
			if(histo.dimension === dimension) histoList.push(histo);
		});
		
		return histoList;
	}
	
	
	
});
