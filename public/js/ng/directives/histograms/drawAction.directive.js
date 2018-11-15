"use strict"

lab.directive('drawAction',function($window, utilities){
		
	function link(scope,element,attr){
	
		let width = 100,
			height = 100;
		if(typeof scope.width != 'undefined' && typeof scope.heigth != 'undefined' ){
			width = scope.width;
			height = scope.height;
		}
		let gd = utilities.buildPlotly(element,width,height); //gd3.node();
		
		scope.$watch('[drawhistolist, fit]', (newValues, oldValues, scope)=> {
			let histoList = newValues[0],
				fitJSON = newValues[1];
			
			if(typeof histoList != 'undefined'){
				let histogram = buildHistogram(histoList, fitJSON);
				Plotly.newPlot(gd, histogram.dataList, histogram.layout);
			}
		},true);
		
		function buildHistogram(histoList, fitJSON){
			let dataList = [],
				layout = {};
			let yaxis = {"showgrid": true};
			
			if(histoList.length>0){
				if(histoList[0].dimension === '1D'){
					yaxis.title = "Counts";
					
					for(let i=0;i<histoList.length;i++){
						dataList.push(histoList[i].data);
					}
				}else{
					let data = histoList[0].data;
					let text = [];
					
					for(let row=0;row<data.z.length;row++){
						let rowText = [];
						for(let col=0;col<data.z[row].length;col++){
							let t;
							if(data.z[row][col] != null && data.errorZ[row][col] != null){
								t = data.z[row][col] + ' &#177; ' + data.errorZ[row][col];
							}
							else{
								t= '';
							} 
							
							rowText.push(t);
							
						}
						text.push(rowText);
					}
					
					yaxis.title = histoList[0].labelY + ' (' + histoList[0].unitsY +')';
			       
					data.text = text;
					data.hoverinfo = 'text';
					dataList.push(data);
				}
				
				layout = {
				          "margin": {
						    "l": 50,
						    "r": 50,
						    "b": 40,
						    "t": 10,
						    "pad": 4
						  },
				          "xaxis": {
				              "title": histoList[0].labelX + ' (' + histoList[0].unitsX +')',
				              showgrid: true,
				            },
				          "yaxis": yaxis,
				          "showlegend": true
					}
				if(histoList.length === 1 && histoList[0].type !== 'StackCounter'){
					let annotations;
					let nEntries ={
						      xref: 'paper',
						      yref: 'paper',
						      x: 0.94,
						      y: 0.98,
						      text: 'N. entries: ' + histoList[0].nentries,
						      showarrow: false,
						      font:{
						        family: 'Arial',
						        size: 12,
						        color: "#3c8dbc"
						      }
						};
					
					if(histoList[0].dimension === '1D'){
						let mean = {
							      xref: 'paper',
							      yref: 'paper',
							      x: 0.94,
							      y: 0.94,
							      text: 'Mean: '  +histoList[0].mean[0].toExponential(3),
							      showarrow: false,
							      font:{
							        family: 'Arial',
							        size: 12,
							        color: "#3c8dbc"
							      }
							    };
						let stdDev = {
							      xref: 'paper',
							      yref: 'paper',
							      x: 0.94,
							      y: 0.90,
							      text: 'Std Dev: '  +histoList[0].rms[0].toExponential(3),
							      showarrow: false,
							      font:{
							        family: 'Arial',
							        size: 12,
							        color: "#3c8dbc"
							      }
							    };
						annotations = [nEntries,mean,stdDev];
					} 
					
					if(histoList[0].dimension === '2D'){
						let meanX = {
							      xref: 'paper',
							      yref: 'paper',
							      x: 0.94,
							      y: 0.94,
							      text: 'Mean X: '  +histoList[0].meanX[0].toExponential(3),
							      showarrow: false,
							      font:{
							        family: 'Arial',
							        size: 12,
							        color: "#3c8dbc"
							      }
							    };
						let meanY = {
							      xref: 'paper',
							      yref: 'paper',
							      x: 0.94,
							      y: 0.90,
							      text: 'Mean Y: '  +histoList[0].meanY[0].toExponential(3),
							      showarrow: false,
							      font:{
							        family: 'Arial',
							        size: 12,
							        color: "#3c8dbc"
							      }
							    };
						
						let stdDevX = {
							      xref: 'paper',
							      yref: 'paper',
							      x: 0.94,
							      y: 0.86,
							      text: 'Std Dev X: '  +histoList[0].stdDevX[0].toExponential(3),
							      showarrow: false,
							      font:{
							        family: 'Arial',
							        size: 12,
							        color: "#3c8dbc"
							      }
							    };
						
						
						let stdDevY = {
							      xref: 'paper',
							      yref: 'paper',
							      x: 0.94,
							      y: 0.82,
							      text: 'Std Dev: '  +histoList[0].stdDevY[0].toExponential(3),
							      showarrow: false,
							      font:{
							        family: 'Arial',
							        size: 12,
							        color: "#3c8dbc"
							      }
							    };
						
						annotations = [nEntries,meanX,meanY,stdDevX,stdDevY];
					}
					
					layout.annotations = annotations;
				}
				
			}else{
				layout = {
				          "margin": {
						    "l": 50,
						    "r": 50,
						    "b": 40,
						    "t": 120,
						    "pad": 4
						  },
						  "title": "No data selected",
						  "titlefont": {
						      size: 24,
						      color: '#3c8dbc'
						    }
				}
				
			}//if histolist.length
		   
		    //fit
		    if(typeof fitJSON != 'undefined' && fitJSON !== null ){
		    	if(fitJSON !== null){
		    		if(!fitJSON.isError){
			    		let fitTotalTrace = {
			  				  x: fitJSON.totalPoints.x,
			  				  y: fitJSON.totalPoints.y,
			  				  name: 'Fit function',
			  				  mode: 'lines',
			  				  type: 'scatter'
			  				};
			  				
			  				dataList.push(fitTotalTrace);
			  				
			  				if(fitJSON.fitFunctions != null){
			  					for(let i=0;i<fitJSON.fitFunctions.length;i++){
			  						let partialFit = fitJSON.fitFunctions[i];
			  						let fitPartialTrace =  {
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
		    
		    let histogram = {
		    		'dataList': dataList,
		    		'layout': layout
		    }
		    
		    return histogram;
		} //buildHistogram
		
		window.onresize = function() {
		    Plotly.Plots.resize(gd);
		};
		
		
	}
	
	return {
		link: link,
		restrict: 'AE',
		scope: { 
				drawhistolist: '=',
				fit: '=',
				width: '=',
				height: '='
			}
	}
	
});
