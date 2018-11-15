"use strict"; 

lab.factory('utilities',function(){
	
	let generateName = function(list,type){
		let name = '';
		if(typeof list != 'undefined'){
			let n=0, subName;
			if(type === 'experiment') subName = 'myExperiment';
			else if(type === 'volume') subName = 'myVolume';
			else if(type === 'source') subName = 'mySource';
			else if(type === 'action') subName = 'myGAMOSData';
			else if(type === 'scorer') subName = 'myScorer';
			else if(type === 'filter') subName = 'myFilter';
			else subName = 'other';
			
			name = subName + n;
			let find = false;
			
			let pos = _.findKey(list,{'name': name});
			if(typeof pos != 'undefined') find = true;
			
			
			while(find){
				n++;
				name = subName + n;
				let pos = _.findKey(list,{'name': name});
				if(typeof pos != 'undefined') find = true;
				else find = false;
			}
			
			
		}
		else name = 'other';
				
		return name;
	}
			
	//filter list of actionList or scorerList
	let getElementList = function(data,elementType,elementList){
		
		let list = [];
		for(let i=0;i<elementList.length;i++){
			
			if(data[elementType].indexOf(elementList[i])<0) list.push(elementList[i]);
		}
		
		return list;
	} 
	
	//remove a filter of in actionList o scorerList
	let delElement = function(data,elementId,elementType){
		data[elementType].splice(elementId,1);
	}
	
	//add a filter to actionList or scorerList
	let addElement = function(data,element,elementType){
		
		if(data[elementType].indexOf(element)<0) 
			data[elementType].push(element);
	}  
	
	//fit function
	let getFuncTotal = function(funcList){
		let funcTotal = "",
		par = 0;
		for(let i=0;i<funcList.length;i++){
			let func = funcList[i].charAt(0);
			if(func === 'g') { //gauss
				let N = par,
					mean = par+1,
					sigma = par+2,
					exponent = '<sup>-1</sup>&frasl;<sub>2</sub>((x-['+mean+'])/['+sigma+'])<sup>2</sup>';
				
				funcTotal += '['+N+']e<sup>'+exponent+'</sup>';
				par +=3;
			}
			
			if(func === 'e'){ //exponential
				let p0 = par,
					p1 = par+1;
				funcTotal += 'e<sup>(['+p0+']+['+p1+']x)</sup>';
				par +=2;
			}
			
			if(func === 'p'){ //polynomial
				let grade = Number(funcList[i].slice(3));
				let polPar = par,
					polText = '['+polPar+']+';
				for(let ii=1;ii<=grade;ii++){
					polPar +=1;
					polText += '['+polPar+']x<sup>'+ii+'</sup>';
					if (ii<grade) polText += '+';
				}
				
				funcTotal += polText;
				par +=grade+1;
			}
			
			if(func === 'l'){ //Landau
				let N = par,
					MPV = par + 1,
					sigma = par + 2;
				funcTotal += '['+N+']'+'*Landau(['+MPV+'],['+sigma+'])';
				par +=3;
			}
			if(i<(funcList.length-1)) funcTotal +='+';
		}
		
		return funcTotal;
	}
	
	//particle name by pdg or gamosName
	let getParticleName = function(searchKey, key,particleList){
		let pA;
		for(let particleType in particleList){
			pA = _.find(particleList[particleType],function(p){
				return p[searchKey] === key;
			})
			
			if(typeof pA != 'undefined') break;
		}
		
		return pA.particleName;
	} 
	
	let buildPlotly = function(element,width,height){
		let d3 = Plotly.d3;
		 
		let WIDTH_IN_PERCENT_OF_PARENT = width,
		    HEIGHT_IN_PERCENT_OF_PARENT = height;

		let gd3 = d3.select(element[0])
		    .append('div')
		    .style({
		        width: WIDTH_IN_PERCENT_OF_PARENT + '%',
		        'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

		        height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
		        'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
		    });
		
		let gd = gd3.node();
		
		return gd;
	}
	
	
	return {
		'generateName': generateName,
		'getElementList': getElementList,
		'addElement': addElement,
		'delElement': delElement,
		'getFuncTotal': getFuncTotal,
		'getParticleName': getParticleName,
		'buildPlotly': buildPlotly
	}
	
});
