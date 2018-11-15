"use strict"

lab.directive('drawPythia',function($window, utilities){
		
	function link(scope,element,attr){
		
		var width = 100,
			height = 100;
		if(typeof scope.width != 'undefined' && typeof scope.heigth != 'undefined' ){
			width = scope.width;
			height = scope.height;
		}
		var gd = utilities.buildPlotly(element,width,height);
		
		scope.$watch('[histogram,fit]', (newValues, oldValues, scope)=> {
			
			var histogram = newValues[0],
				fitJSON = newValues[1];
			if(typeof histogram != 'undefined'){
				
				var dataName = histogram.dataName,
					min = histogram.minX,
					max = histogram.maxX,
					nBins = histogram.nbins,
					y = histogram.data.y;
					
				var dx = (max - min)/ nBins;
				var x = _.range(0, max+dx, dx);
				
				var histogramData = {
						x: x,
						y: y,
						type: 'bar',
						name: dataName
					};
				
				var dataList = [histogramData];
				
				if(typeof fitJSON != 'undefined'){
					if(fitJSON != null){
						if(!fitJSON.isError){
							var fitTotalTrace = {
							  x: fitJSON.totalPoints.x,
							  y: fitJSON.totalPoints.y,
							  name: 'Fit function',
							  mode: 'lines',
							  type: 'scatter'
							};
							
							dataList.push(fitTotalTrace);
							
							if(fitJSON.fitFunctions != null){
								for(var i=0;i<fitJSON.fitFunctions.length;i++){
									var partialFit = fitJSON.fitFunctions[i];
									var fitPartialTrace =  {
											  x: partialFit.x,
											  y: partialFit.y,
											  name: '#' + i + ' ' + partialFit.fitFunction,
											  mode: 'lines',
											  type: 'scatter'
											};
									dataList.push(fitPartialTrace);
								}
							}
						}
					}
				}
				
				var titleX = dataName;
				if(histogram.unitsX !== 'null' ) titleX +=  ' (' + histogram.unitsX + ')';
				var layout = {
						margin: {
							 "l": 50,
							 "r": 50,
							 "b": 40,
							 "t": 40,
							 "pad": 4
						},
						title: dataName + ', particle: '+ histogram.particleName,
						titlefont: {
						    family: 'Courier New, monospace',
						    size: 16,
						    color: '#7f7f7f'
						 },
						showlegend: true,
						xaxis: {
								title: titleX
							   },
						yaxis:  {title: 'Count'},
						bargap: 0.1,
						barmode: 'stack'
				}
				
				Plotly.newPlot(gd, dataList,layout);
				
			}// if undefined
			
		},true);
		
		window.onresize = function() {
		    Plotly.Plots.resize(gd);
		};
	}
	
	return {
		link: link,
		restrict: 'AE',
		scope: { 
				histogram: '=',
				fit: '=',
				width: '=',
				height: '='
			}
	}
	
});
