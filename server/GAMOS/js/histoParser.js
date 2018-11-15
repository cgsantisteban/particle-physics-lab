"use stricts";

const fs = require('fs');
const math = require('mathjs');

exports.buildHistos = function(actionList,scorerList,socket, folder){

	
	var completedHistograms = 0;
	var totalHistograms = [];
	var histogramList = {
		actionHistograms: [],
		scorerHistograms: []
	};
	
	function isTotalHistograms(){
		completedHistograms++;
		if(completedHistograms === totalHistograms.length) {
			socket.emit('exp:Histograms',histogramList);
		}
	}
	
	actionList.forEach(function(action){
		
		var actionHistogram = (function(action){
				return function(){
					var actionFile = folder + '/' + action.name + '.csv';
					fs.readFile(actionFile, function (err, dataFile) {
							var histoList = [];
							if(err){
						 		var error = {
										'file': actionFile,
										'description': 'No histogram file',
										'dataType': "gamos-data"
									};
						 		
								socket.emit('error:File',error);
						 		console.error(err);
						 	}
							else{
								if(action.actionType === 'Stack'){
									var dataList = action.dataList;
									var lines = dataFile.toString().split('\n');
									var histoStackList = [];
									
									for(var i=0;i<dataList.length;i++){
										var actionData = dataList[i].data[0];
										
										var dimension = dataList[i].dimension,
											particle = actionData.particle.particleName;
											histogram = actionData.particle.gamosName;
											nBin = actionData.nbins || 100, 
											initBin = actionData.limits[0] || 0, 
											endBin = actionData.limits[1] || 5000;
										
										var sizeBin = (endBin - initBin) / nBin;
										
										var data = {
												x: [],
												autobinx: false,
											    xbins: {
												    start: initBin,
												    end: endBin,
												    size: sizeBin 
											  	},
											  	name: particle,
											    type: 'histogram'
											};
										
										var histogram = {
												type: 'StackCounter',
												dimension: dimension,
												histogram: histogram,
												dataName: particle,
												labelX: particle,
												minX: initBin,
												maxX: endBin,
												nbins: nBin,
												nentries: lines.length - 2,
												data : data,
												dataClassifier: null,
												unitsX: 'counts'
											 }
										
										histoStackList.push(histogram);
									}
									
									for(var i=1;i<lines.length -1;i++){
										
										var tokens = lines[i].split(",");
										
										for(var ii=0;ii<tokens.length;ii++){
											
											var count = Number(tokens[ii]);
											if(count>0) histoStackList[ii].data.x.push(count);
										}
									}
									histoList = histoList.concat(histoStackList);
									
								}else{
								    var	lines = dataFile.toString();
									histoList = histoActionParser(lines,action);
								}
							
								var dataHisto = {
										"actionName": action.name,
										"histogramList": histoList
								}

								histogramList.actionHistograms.push(dataHisto);
								isTotalHistograms();
							}
					}); // readFile	
									
				}
			    })(action)
		totalHistograms.push(actionHistogram);
	
	});

	scorerList.forEach(function(scorer){ //scorer histograms
		
		var scorerHistogram = (function(scorer){
			return function(){
				var scorerFile = folder + '/' + scorer.name+'.out';
				fs.readFile(scorerFile, function (err, data) {
					if(err){
				 		var error = {
								'file': scorerFile,
								'description': "No scorer histogram file",
								'dataType': 'scorer'
							};
						socket.emit('error:File',error);
				 		console.log(err);
				 	}else{
				 		var classifierName = scorer.classifierName,
						lines = data.toString(),
						histo = histoScorerParser(lines,scorer.data);
					
						var isClassifier = false;
						if(scorer.classifierList.length>0) isClassifier = true;
						var dataHisto = {
								"scorerName": scorer.name,
								"dataName": scorer.data,
								"volume": scorer.volume,
								"histogram": histo,
								"isClassifier": isClassifier
						}
						histogramList.scorerHistograms.push(dataHisto);
						isTotalHistograms();
				 	}
				}); //readFile
			}
		 })(scorer)
	
		totalHistograms.push(scorerHistogram);
		
	});

	for(var histogram in totalHistograms){ //all histograms
		totalHistograms[histogram](); 
	} 
	
	function histoActionParser(data,action){ //devuelve un array con todos los histoJSON correspondientes a un GAMOS data
		
		var result =[];
		var lines = data.split('\n');
		var isClassifier = (action.classifierList.length > 0) && (typeof action.classifierList != 'undefined');
		lines.forEach(function(histoLine) {
			var typeAction,
				dataClass = [];
			
			if(histoLine !== '') {
				var token = histoLine.split(',');
				var dimension = token[0].split("\"")[1];
				//conseguimos el dato medido
				var dataClassString = token[1].split(':'),
					lDataString = dataClassString.length,
					lData = dataClassString[lDataString-1].length;
				
				var fileRoot = token[1].split("\""),
					histoROOTName = fileRoot[1]+';1'; 
				
				var dataString = dataClassString[lDataString-1].slice(0,lData-1);
			
				//conseguimos el dato clasificado
				var dataClassifier = null;
				if(isClassifier){
					dataClassifier = dataClassString[lDataString-2];//classString.split('_');
				}
				
				//var units = getUnits(dataName);
				var histo = {
						'histogram': histoROOTName,
						'type': 'actionHistogram',
						'dimension': dimension
				};
				
				if(dimension === '2D'){
					var nbinsX = Number(token[2]),
						minX = Number(token[3]),
						maxX = Number(token[4]),
						nbinsY = Number(token[5]),
						minY = Number(token[6]),
						maxY = Number(token[7]);
					
					var initData = 8 + 2*nbinsY + 6,
						endData = token.length - 21 - 4,
						nx = ny = 1,
						error = [],
						xArray = [],
						yArray = [],
						zArray = []
						zErrorArray = [],
						z = [],
						errorZ = []; 
					
					var x = minX, 
						y = minY;
					var stepX = Number(((maxX - minX) / nbinsX).toFixed(4)),
						stepY = Number(((maxY - minY) / nbinsY).toFixed(4));
					var pos = initData;
					var indexX = 0,
						indexY = 0,
						nIter = 1;
					
					while(x<maxX){
						if(y < maxY){
							var d = Number(token[pos]),
								e = Number(token[pos+1]);
							
							var yCoord = Number((y + stepY/2).toFixed(3));
							if(nIter<2) yArray.push(yCoord);
							y = Number((y + stepY).toFixed(4));
							pos = pos + 2;
							if(d == 0 && e == 0){
								zArray[indexY] = null;
								zErrorArray[indexY] = null;
							}else{
								zArray[indexY] = d.toExponential(5);
								zErrorArray[indexY] = e.toExponential(5);
							}
							indexY++;
							
						}else{
							nIter++;
							z.push(zArray);
							errorZ.push(zErrorArray);
							indexY = 0;
							zArray = [];
							zErrorArray = [];
							var xCoord = Number((x + stepX/2).toFixed(3));
							xArray.push(xCoord);
							
							pos += 4;
							y = minY;
							x = Number((x +stepX).toFixed(4));
							indexX++;
								
						}
					}//while 
					
					var zT = math.transpose(z), // transpose matrix for plotly
						eT = math.transpose(errorZ); 
					var data = {
						'x' : xArray,
						'y': yArray,
						'z': zT,
						'errorZ': eT,
						'type': 'heatmap',
						'colorscale': 'Jet'
					}
					var length = token.length;
					var nentries = 0,
						meanX = [],
						meanY = [],
						stdDevX = [],
						stdDevY = [];
					if(length>9){
						nentries = Number(token[length - 9]);
						meanX = [Number(token[length-8]),Number(token[length - 7])];
						stdDevX = [Number(token[length-6]),Number(token[length - 5])];
						meanY = [Number(token[length-4]),Number(token[length - 3])];
						stdDevY = [Number(token[length-2]),Number(token[length - 1])];
					}
					
					histo.nbinsX = nbinsX;
					histo.minX = minX;
					histo.maxX = maxX;
					histo.nbinsY = nbinsY;
					histo.minY = minY;
					histo.maxY = maxY;
					histo.data = data;
					histo.nentries = nentries;
					histo.meanX = meanX;
					histo.meanY = meanY;
					histo.stdDevX = stdDevX;
					histo.stdDevY = stdDevY;
					
					//axis label
					var dataNameList = dataString.split('.vs.');
					var dataX = dataNameList[0],
						dataY = dataNameList[1],
						labelX, labelY, unitsX, unitsY;
					var actionDataList = action.dataList;
					for(var i=0;i<actionDataList.length;i++){
						var dataAction = actionDataList[i].data;
						for(var ii=0;ii<dataAction.length;ii++){
							if(dataX === dataAction[ii].gamosName){
								labelX = dataAction[ii].name;
								unitsX = dataAction[ii].units;
								break;
							}
						}
					}
					for(var i=0;i<actionDataList.length;i++){
						var dataAction = actionDataList[i].data;
						for(var ii=0;ii<dataAction.length;ii++){
							if(dataY === dataAction[ii].gamosName){
								labelY = dataAction[ii].name;
								unitsY = dataAction[ii].units;
								break;
							}
						}
					}
					
					histo.labelX = labelX;
					histo.unitsX = unitsX;
					histo.labelY = labelY;
					histo.unitsY = unitsY;
					
				}else{ //1D
					var dataName = dataString,
						y = [],
						errorY = [];
					for(var ii=7;ii<token.length-7;ii++){
					       var value = null;
					       if(token[ii] != "0") value = Number(token[ii]);
					       
						   if(ii % 2 !=0) {
							   y.push(value);
						   }
						   else {
							   errorY.push(value);
						   }
					}
					
					var error_y = {
							type: 'data',
							visible: true,
							array: errorY
					}
					
					histo.nbins = Number(token[2]);
					histo.minX = Number(token[3]);
					histo.maxX = Number(token[4]);
					histo.mean = [Number(token[token.length-4]),Number(token[token.length-3])];
					histo.rms = [Number(token[token.length-2]),Number(token[token.length-1])];
					histo.nentries = Number(token[token.length-5]);
			
					//axis label
					var dataX = dataString,
						labelX, unitsX;
					var actionDataList = action.dataList;
					for(var i=0;i<actionDataList.length;i++){
						var dataAction = actionDataList[i].data;
						for(var ii=0;ii<dataAction.length;ii++){
							if(dataX === dataAction[ii].gamosName){
								labelX = dataAction[ii].name;
								unitsX = dataAction[ii].units;
								break;
							}
						}
					}
		
					var x = []
						errorX = [],
						widthBin = 1;
					if(histo.nbins !== 0) widthBin = (histo.maxX - histo.minX) / histo.nbins;
					for(var i=0;i<histo.nbins;i++){
						valueX = histo.minX + widthBin*(2*i+1)/2;
						x.push(valueX);
						errorX.push(widthBin/2);
					}
					var error_x = {
							type: 'data',
							visible: true,
							array: errorX
					} 
					
					var data = {
							x: x,
							y: y,
							error_x: error_x,
							error_y: error_y,
							mode: 'markers',
			  				type: 'scatter',
			  				name: labelX
						}
					
					histo.data = data;
					histo.labelX = labelX;
					histo.unitsX = unitsX;
					
				}
					
				if(typeof dataClassifier !== 'undefined' && dataClassifier !== null) {
					var multiClass = dataClassifier.split('_');
					if(multiClass.length>1) dataClassifier = multiClass[0]  + ' / ' + multiClass[1];
					histo.data.name = dataClassifier;
					histo.dataClassifier = dataClassifier;
				}
			
				result = result.concat(histo);
				
			}
		});
		
		return result;
		
	}

	//parsea el archivo de salida de un scorer a un histoJSON
	function histoScorerParser(data,dataName){
		
		var lines = data.split('\n');
		var indexString = 'index:';
		
		var dataScorer = {
			"name": dataName,
			x: [],
			y: [],
			text: [],
			sumW2: [],
			error_y: {
				type: 'data',
				array: [],
				visible: true,
				width: 0
			},
			mode: 'markers',
			type: 'scatter',
			marker: { size: 2 },
			units: ''
		}
		
		var finalLine = 'SUM_ALL:';
		for(var i=0; i<lines.length;i++){
			var line = lines[i].split(' ');
			var data = {};
			
			if(line[2] === indexString){
				var x = Number(line[3]);
				if(isNaN(x)) x = line[3];
				var	y = Number(line[6]).toExponential(5);
				dataScorer.x.push(x);
				dataScorer.y.push(y);
				var error = (Number(line[8])*Number(line[6])).toExponential(5);
				dataScorer.error_y.array.push(error);
				dataScorer.sumW2.push(Number(line[11]).toExponential(5))
			}
			
			
			if(lines[i].includes(finalLine)){
				for(var ii=0;ii<line.length;ii++){
					if(line[ii].includes('CLHEP')){
						var unitsLine = line[ii].split('::');
						dataScorer.units = unitsLine[1];
						break;
					}
				}
				
			}
		}
		
		return dataScorer;

	}
}

