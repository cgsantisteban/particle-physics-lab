"use strict"; 

lab.factory('buildMacro',function(modelSourceService){
	
	
	//---- Header -----------//
	var buildHeader = function(expJSON){
		
		var isVisualization = expJSON.isVisualization,
			geomFile = expJSON.geomFile,
			physicsLib = expJSON.physicsLib,
			processRemoveList = expJSON.processRemove,
			electricField = expJSON.emField.electric,
			magneticField = expJSON.emField.magnetic,
			localMagnetic = expJSON.localField.magnetic,
			isPythia = expJSON.isPythia,
			nBeams = expJSON.nBeams;
		
		var header = [];
		
		var seed1 = Math.floor((Math.random()*100000)+1), 
			seed2 = Math.floor((Math.random()*100000)+1);
		
		
		var seedStrings = '/gamos/random/setSeeds ' + seed1 + " " + seed2,
			geomFileString = '/gamos/setParam GmGeometryFromText:FileName ' + geomFile,
			geomString= '/gamos/geometry GmGeometryFromText',
			physicsLibString = '/gamos/physicsList ' + physicsLib,
			initializeString = '/run/initialize',
			csvFileString = '/gamos/analysis/fileFormat csv',
			rootFileString = '/gamos/analysis/addFileFormat root';
		
		var generatorString;
		if(isPythia)
			generatorString = '/gamos/generator HepMCGeneratorAction';
		else
			generatorString = '/gamos/generator GmGenerator';
		
		header.push(seedStrings, geomFileString, geomString, physicsLibString, 
				generatorString, initializeString, csvFileString, rootFileString )
		
		var volumeList = expJSON.geometry.volumeList;
		var isScintillator = _.find(volumeList,function(v){
			return v.materialType === 'scintillator';
		})
		
		if(typeof isScintillator != 'undefined'){
			var opticalphotonString = '/gamos/physics/addPhysics opticalphoton';
			header.push(opticalphotonString);
		}
			
		//Uniform EM fields
		if(typeof electricField != 'undefined'){
			if(electricField !== null){
				if(electricField["Ex"].value !== 0 || electricField["Ey"].value !== 0 || electricField["Ez"].value !== 0){
					
					header.push('#Electric field')
					var electricString = '/gamos/field/setElecField ' + electricField["Ex"].value + '*' + electricField["Ex"].units + ' '+
								 electricField["Ey"].value + '*' + electricField["Ey"].units + ' ' + 
								+ electricField["Ez"].value + '*' + electricField["Ez"].units;
					header.push(electricString);
				}
			}
		}
		
		if(typeof magneticField != 'undefined'){
			if(magneticField !== null){
				if(magneticField["Bx"].value !== 0 || magneticField["By"].value !== 0 || magneticField["Bz"].value !== 0){
					var magneticString = '/gamos/field/setMagField '+ magneticField["Bx"].value + '*' + magneticField['Bx'].units + ' '+ 
								 magneticField["By"].value + '*' + magneticField["By"].units + ' ' +  
								 magneticField["Bz"].value + '*' + magneticField["Bz"].units;
					
					header.push('#Magnetic field');
					header.push(magneticString);
				}
			}
		}
		
		//Local magnetic field
		// /gamos/magneticField/setLocalField FIELD_X FIELD_Y FIELD_Z VOLUME_1 VOLUME_2 ... VOLUME_N
		var isLocalField = false;
		for(var field in localMagnetic){
			isLocalField = isLocalField || (localMagnetic[field].value != 0);
		}
		if(isLocalField){
			var mVolumeList = [];
			for(var i=0;i<volumeList.length;i++){
				if(volumeList[i].isMagnetic){
					mVolumeList.push(volumeList[i]);
				}
			}
			var localMagneticString = null;
			if(mVolumeList.length>0){
				localMagneticString = '/gamos/field/setLocalMagField ';
				
				for(var field in localMagnetic){
					localMagneticString += localMagnetic[field].value + '*' + localMagnetic[field].units + ' ';
				}
				for(var i=0;i<mVolumeList.length;i++){
					localMagneticString += mVolumeList[i].name + ' '; 
				}
			}
			
			if(localMagneticString !== null) {
				header.push('#Local magnefic field');
				header.push(localMagneticString);
			}
		}
		
		
		//process
		for(var i=0; i<processRemoveList.length;i++){
			var removeString = '/gamos/physics/removeProcessesByName '+processRemoveList[i];
			header.push(removeString);
		}
		
		var eachNEvent = parseInt(nBeams / 10);
		if(eachNEvent <=0) eachNEvent = 1;
		var countSetTrackString = '/gamos/setParam GmCountTracksUA:EachNEvent' + ' ' + eachNEvent;
		var 	countTracksString = '/gamos/userAction GmCountTracksUA';
		var 	countProcessesString = '/gamos/userAction GmCountProcessesUA';
		header.push(countSetTrackString, countTracksString, countProcessesString);
		
		
		//VISUALIZATION
		if(isVisualization){
			var wrlCommand = [ '#VISUALIZATION',
									'/vis/open VRML2FILE',
									'/vis/viewer/set/autoRefresh false',
									'/vis/verbose errors',
									'/vis/drawVolume',
									'/vis/viewer/set/viewpointThetaPhi 0. 0.',
									'/vis/viewer/zoom 1.4',
									'/vis/scene/add/trajectories smooth',
									'/vis/modeling/trajectories/create/drawByCharge',
									'/vis/scene/endOfEventAction accumulate',
									'/vis/viewer/set/autoRefresh true',
									'/vis/verbose warnings',
									'#END VISUALIZATION'
						  ];
			
			header = header.concat(wrlCommand);	
		}
		
		//Decay
		var particleDecay = '/gamos/physics/addPhysics decay',
			radioactiveDecay = '/gamos/physics/addPhysics radioactiveDecay';
		
		header.push(particleDecay,radioactiveDecay);
		
		return header;

	}
	//--------------------- header end --------------------------------------//
	
	
	
	
	//-------- Sources --------------------- //
	var buildSource = function(sourceJSON){
		
		var sourceList = modelSourceService.getParticleList(),
			sourceType = Object.keys(sourceList),
			particles = sourceList.particles,
			particleTypeList = Object.keys(particles);
		
		
		var commands = [];
		
		var sourceName = sourceJSON.name,
			sourceType = sourceJSON.type,
			gamosName = sourceJSON.particle.gamosName,
			positionType = sourceJSON.distributions["Position"].type;
		
		//Define the source
		var beginLine = "#Source " + sourceName;
		commands.push(beginLine);
		  
		var lineDefinition = '/gamos/generator/'
		if(sourceType === 'particles'){ //particle
			lineDefinition = lineDefinition + 'addSingleParticleSource '+sourceName+' ' + gamosName +' '+ 0; 
		}
		
		if(sourceType === 'isotopes'){
			var massNumber = sourceJSON.particle.parameters['Mass number'].value,
				excitationE = sourceJSON.particle.parameters['Excitation energy'].value,
				uE = sourceJSON.particle.parameters['Excitation energy'].units;
			gamosName = gamosName+massNumber;
			lineDefinition = lineDefinition + 'addSingleParticleSource '+sourceName+' '+gamosName+'['+excitationE + '*' + uE +'] '+ 0;
		}
		
		var energyType, directionType, timeType;
		if(sourceType === 'GAMOS isotopes'){ 
			var activity = sourceJSON.particle.parameters['activity'].value,
				  uA = sourceJSON.particle.parameters['activity'].units;
			lineDefinition = lineDefinition + 'addIsotopeSource '  +  sourceName + ' ' + gamosName + ' ' + activity + '*' + uA;
		}
		else{
			energyType = sourceJSON.distributions["Energy"].type;
			directionType = sourceJSON.distributions["Direction"].type;
			timeType = sourceJSON.distributions["Time"].type;
		}
		
		//Energy distribution
		var energyString;
		if(sourceType === 'GAMOS isotopes'){
			energyString = null;
		}else{
			var gamosEnergy = sourceJSON.distributions["Energy"].gamosName;
			var energyString = '/gamos/generator/energyDist ' + sourceName + ' ' + gamosEnergy + ' ';
			switch (energyType) {
			    case 'Constant energy':
			    	var energy =  sourceJSON.distributions["Energy"].parameters["Energy"].value,
			    		uEnergy = sourceJSON.distributions["Energy"].parameters["Energy"].units;
			        energyString += energy + '*' + uEnergy;
			        break;
			    case 'Random flat energy':
			    	var minEnergy = sourceJSON.distributions["Energy"].parameters["min. energy"].value,
			    		maxEnergy = sourceJSON.distributions["Energy"].parameters["max. energy"].value,
			    		uMin = sourceJSON.distributions["Energy"].parameters["min. energy"].units,
			    		uMax = sourceJSON.distributions["Energy"].parameters["max. energy"].units; 
			    	energyString += minEnergy + '*' + uMin + ' ' + maxEnergy + '*' + uMax;  
			        break;
			    case 'Gaussian':
			    	var mean = sourceJSON.distributions["Energy"].parameters["mean"].value,
			    		sigma = sourceJSON.distributions["Energy"].parameters["sigma"].value,
			    		uMean = sourceJSON.distributions["Energy"].parameters["mean"].units,
			    		uSigma = sourceJSON.distributions["Energy"].parameters["sigma"].units;
			        energyString += mean + '*' + uMean + ' ' + sigma + '*' + uSigma;
			        break;
			    default: 
		        	energyString = null;
			};
		}
		
		//Position distribution
		var positionString;
		var gamosPosition = sourceJSON.distributions["Position"].gamosName;
		var positionString =  '/gamos/generator/positionDist '+ sourceName + ' ' + gamosPosition + ' ';
		switch (positionType) {
		    case 'Point':
		    	var posX = sourceJSON.distributions["Position"].parameters["x"].value,
		    		posY = sourceJSON.distributions["Position"].parameters["y"].value,
		    		posZ = sourceJSON.distributions["Position"].parameters["z"].value,
		    		uX = sourceJSON.distributions["Position"].parameters["x"].units,
		    		uY = sourceJSON.distributions["Position"].parameters["y"].units,
		    		uZ = sourceJSON.distributions["Position"].parameters["z"].units;
		    	positionString += posX + '*' + uX + ' ' + posY + '*' + uY + ' ' + posZ + '*' + uZ;
		        break;
		    case 'Volume':
		    	var volume = sourceJSON.distributions["Position"].parameters["volume"].value;
		    	positionString += volume; 
		        break;
		    case 'Volume surface':
		    	var volume = sourceJSON.distributions["Position"].parameters["volume"].value;
		        positionString += volume;
		        break;
		    default: 
	        	positionString = null;
		};
		
		//Direction distribution
		var directionString;
		if(sourceType === 'GAMOS isotopes'){
			directionString = null;
		}
		else{
			var gamosDirection = sourceJSON.distributions["Direction"].gamosName;
			var directionString = '/gamos/generator/directionDist ' + sourceName + ' ' + gamosDirection + ' ';
			switch (directionType) {
			    case 'Constant':
			    	var dirX = sourceJSON.distributions["Direction"].parameters["x"].value,
			    		dirY = sourceJSON.distributions["Direction"].parameters["y"].value,
			    		dirZ = sourceJSON.distributions["Direction"].parameters["z"].value;
			    	directionString += dirX + ' ' + dirY + ' ' + dirZ;
			        break;
			    case 'Cone':
			    	var dirX = sourceJSON.distributions["Direction"].parameters["x"].value,
			    		dirY = sourceJSON.distributions["Direction"].parameters["y"].value,
			    		dirZ = sourceJSON.distributions["Direction"].parameters["z"].value,
			    		angle = sourceJSON.distributions["Direction"].parameters["angle"].value,
			    		uAngle = sourceJSON.distributions["Direction"].parameters["angle"].units;
			        directionString += dirX + ' ' + dirY + ' ' + dirZ + ' ' + angle + '*' + uAngle;
			        break;
			    default: 
		        	directionString = null;
			};
		}
		
		//Time distribution
		var timeString;
		if(sourceType === 'GAMOS isotopes'){
			timeString = null;
		}	
		else{
			var gamosTime = sourceJSON.distributions["Time"].gamosName;
			var timeString = '/gamos/generator/timeDist ' + sourceName + ' ' + gamosTime + ' ';
			
			switch (timeType) {
			    case 'Constant time':
			    	var time = sourceJSON.distributions["Time"].parameters["Time"].value,
			    		uTime = sourceJSON.distributions["Time"].parameters["Time"].units;
			    	timeString += time + '*' + uTime; 
			        break;
			    case 'Time changing':
			    	var timeInterval = sourceJSON.distributions["Time"].parameters["Time interval"].value,
			    		timeOffset = sourceJSON.distributions["Time"].parameters["Time offset"].value,
			    		uTimeInterval = sourceJSON.distributions["Time"].parameters["Time interval"].units,
			    		uTimeOffset = sourceJSON.distributions["Time"].parameters["Time offset"].units;
			    	timeString += timeInterval + '*' + uTimeInterval + ' ' + timeOffset + '*' + uTimeOffset;
			    	break;
			    case 'Decay time':
			    	var activity = sourceJSON.distributions["Time"].parameters["Activity"].value,
			    		uActivity = sourceJSON.distributions["Time"].parameters["Activity"].units,
			    		lifetime = sourceJSON.distributions["Time"].parameters["Life time"].value,
			    		uLifeTime = sourceJSON.distributions["Time"].parameters["Life time"].units;
			    	timeString += activity + '*' + uActivity + ' '+ lifetime + '*' + uLifeTime; 
			    	break;
			    default: 
		        	timeString = null;
			};
		}
			
		if(sourceType === 'defined isotope'){
			
			// /gamos/generator/addIsotopeSource SOURCE_NAME ISOTOPE_NAME ACTIVITY
			var isotope = sourceJSON.gamosName;
				activity = sourceJSON.activity;
			
			lineDefinition = '/gamos/generator/addIsotopeSource' + ' '+ sourceName + ' '+ isotope + ' ' + activity+'*Bq';
		}
		
		commands.push(lineDefinition);
		
		if(energyString != null){
			commands.push(energyString);
		} 
		
		commands.push(positionString);
		
		if(directionString != null){
			commands.push(directionString);
		} 
		
		if(timeString != null){
			commands.push(timeString);
		}	
		
		return commands;
	}

	//---------------- sources end -----------------------//
	
	//GAMOS Data
	var buildGAMOSData = function(actionJSON){
		
		var actionName = actionJSON.name,
			actionType = actionJSON.actionType;
		
		var commands = [];
		
		if(actionType === 'Stack'){ //Stack counter plugin

			var dataList = actionJSON.dataList;	
			
			// /gamos/userAction CounterStackingAction
			// /GC/file/setOutFile outFiles/salidaFinal
			// /GC/particle/setParticle opticalphoton e-
			// /GC/histogram/setNBin 150 100
			// /GC/histogram/setInitBin 0 0 
			// /GC/histogram/setEndBin 5800 200
			var actionString = '/gamos/userAction CounterStackingAction',
				file = actionJSON.name,
			    fileString = '/GC/file/setOutFile' + ' ' +file;
			   
			var particleString = '/GC/particle/setParticle ',
				nBinString = '/GC/histogram/setNBin ',
				initBinString = '/GC/histogram/setInitBin ',
				endBinString = '/GC/histogram/setEndBin ';
			
			for(var i=0;i<dataList.length;i++){
				
				var particle = dataList[i].data[0].particle.gamosName || 'geantino',
					nBin = dataList[i].data[0].nbins || 100,
					initBin = dataList[i].data[0].limits[0] || 0,
					endBin = dataList[i].data[0].limits[1] || 6000;
					
				particleString += particle + ' ';
				nBinString += nBin + ' ';
				initBinString += initBin + ' ';
				endBinString += endBin + ' ';
			}
			
			commands.push(actionString, fileString, particleString, nBinString, initBinString, endBinString);
			
		}else{
			
			var classifierList = actionJSON.classifierList,
				filterList = actionJSON.filterList,
				dataList = actionJSON.dataList;
			
			var action = 'Gm'+actionType+'DataHistosUA';
			
			// /gamos/classifier ClassifierByParticleAndProcess GmCompoundClassifier GmClassifierByParticle GmClassifierByProcess
			var classifierName, classifierString;
			if(typeof classifierList != 'undefined' && classifierList !== null && classifierList.length>0){
				classifierName = 'classifier'+actionName;
				classifierString = '/gamos/classifier ' + classifierName + ' GmCompoundClassifier ';
				for(var i=0;i<classifierList.length;i++){
					classifierString = classifierString + classifierList[i].gamosName + ' ';
				}
				commands.push(classifierString);
			}
			
			// /gamos/setParam GmStepDataHistosUA_filter1_filter2_..._classifier:FileName nameAction
			// /gamos/setParam GmStepDataHistosUA_filter1_filter2_..._classifier:Data data1 data2 ....
			// /gamos/userAction GmStepDataHistosUA filter1 filter2 .... classifier
			var command = '/gamos/setParam '+ action,
				commandAction = '/gamos/userAction '+ action;
			
			for(var i=0;i<filterList.length;i++){
				command = command + '_' + filterList[i].name;
				commandAction = commandAction+' '+filterList[i].name;
			}
			var commandFile,commandParam;
			if(typeof classifierList != 'undefined' && classifierList !== null && classifierList.length>0){
				commandFile = command + '_' + classifierName + ':FileName'
				commandParam = command + '_' + classifierName + ':DataList';
			}
			else{
				commandFile = command + ':FileName'
				commandParam = command + ':DataList';
			}
			
			commandFile = commandFile + ' ' + actionName;
			
			var command1DHisto = [];
			for(var ii=0;ii<filterList.length;ii++){
					action = action + '_' + filterList[ii].name;
					
			}
			for(var i=0;i<dataList.length;i++){
				var dimension = dataList[i].dimension;
							
				if(dimension === '1D'){
					var data = dataList[i].data[0].gamosName;
						
					// /gamos/analysis/histo1NBins HISTO_NAME VALUE
					// /gamos/analysis/histo1Min HISTO_NAME VALUE
					// /gamos/analysis/histo1Max HISTO_NAME VALUE
					commandParam = commandParam+' '+ data;
					var nbins = dataList[i].data[0].nbins,
						min = dataList[i].data[0].limits[0],
						max = dataList[i].data[0].limits[1],
						units = dataList[i].data[0].units;
						
					var commandNbins = '/gamos/analysis/histo1NBins ' + action,
						commandMin = '/gamos/analysis/histo1Min ' + action,
						commandMax = '/gamos/analysis/histo1Max ' + action;
					
					if(typeof classifierName !== 'undefined' && classifierName != null){
						commandNbins += '_' + classifierName + '*' + ':' + data;
						commandMin += '_' + classifierName + '*' + ':' + data;
						commandMax += '_' + classifierName + '*' + ':' + data;
					}else{
						commandNbins += ':' + data;
						commandMin += ':' + data;
						commandMax += ':' + data;
					}
					
					commandNbins += ' ' + nbins;
					commandMin += ' ' + min + '*' + units,
					commandMax += ' ' + max + '*' + units;
					
					command1DHisto.push(commandNbins)
					command1DHisto.push(commandMin)
					command1DHisto.push(commandMax);
				}
				
				var command2DHisto = [];
				if(dimension === '2D'){
					var data = dataList[i].data[0].gamosName + '.vs.' + dataList[i].data[1].gamosName,
						histogramName = action + ':' + data;
					
					//	/gamos/analysis/histo2NBinsX HISTO_NAME VALUE
					//	/gamos/analysis/histo2MinX HISTO_NAME VALUE
					//	/gamos/analysis/histo2MaxX HISTO_NAME VALUE
					//	/gamos/analysis/histo2NBinsY HISTO_NAME VALUE
					//	/gamos/analysis/histo2MinY HISTO_NAME VALUE
					//	/gamos/analysis/histo2MaxY HISTO_NAME VALUE
					var nbinsX = dataList[i].data[0].nbins,
						minX = dataList[i].data[0].limits[0],
						maxX = dataList[i].data[0].limits[1],
						unitsX = dataList[i].data[0].units,
						nbinsY = dataList[i].data[1].nbins,
						minY = dataList[i].data[1].limits[0],
						maxY = dataList[i].data[1].limits[1],
						unitsY = dataList[i].data[1].units;
					
					var commandNbinsX = '/gamos/analysis/histo2NBinsX ' + action,
						commandMinX = '/gamos/analysis/histo2MinX ' + action,
						commandMaxX = '/gamos/analysis/histo2MaxX ' + action,
						commandNbinsY = '/gamos/analysis/histo2NBinsY ' + action,
						commandMinY = '/gamos/analysis/histo2MinY ' + action, 
						commandMaxY = '/gamos/analysis/histo2MaxY ' + action;
					
					if(typeof classifierName !== 'undefined' && classifierName != null){
							commandNbinsX += '_' + classifierName + '*' + ':' + data;
							commandMinX += '_' + classifierName + '*' + ':' + data;
							commandMaxX += '_' + classifierName + '*' + ':' + data;
							commandNbinsY += '_' + classifierName + '*' + ':' + data;
							commandMinY += '_' + classifierName + '*' + ':' + data;
							commandMaxY += '_' + classifierName + '*' + ':' + data;
					}else{
							commandNbinsX += ':' + data;
							commandMinX += ':' + data;
							commandMaxX += ':' + data;
							commandNbinsY += ':' + data;
							commandMinY += ':' + data;
							commandMaxY += ':' + data;
						}
					
					commandNbinsX += ' ' + nbinsX;
					commandMinX += ' ' + minX + '*' + unitsX;
					commandMaxX += ' ' + maxX + '*' + unitsX;
					commandNbinsY += ' ' + nbinsY;
					commandMinY += ' ' + minY + '*' + unitsY;
					commandMaxY += ' ' + maxY + '*' + unitsY;
					
					
					command2DHisto = [commandNbinsX, commandMinX, commandMaxX, commandNbinsY, commandMinY, commandMaxY];
					commandParam = commandParam + ' ' + data;
				}
				
			}
			
			if(classifierList !== null && classifierList.length>0) commandAction = commandAction+' '+classifierName;
			
			commands.push(commandFile);
			commands.push(commandParam);
			
			for(var i=0;i<command1DHisto.length;i++){
				commands.push(command1DHisto[i]);
			}
			
			for(var i=0;i<command2DHisto.length;i++){
				commands.push(command2DHisto[i]);
			}
			
			commands.push(commandAction);
			
		}
		
		return commands;
		
	}
	
	var buildScorers = function(scorerList,volumeList){
		
		var volumeScorerList = [],
			mfdList = {};
		
		//var commands = [];
		
		var macroCommand = [];
		scorerList.forEach(function(scorer) {
			var commands = [];
			commands.push('#' + scorer.name);
			var volume = scorer.volume;
			var scorerVolume = _.find(volumeList,function(v){
				return v.name === volume;	
			});
			if(scorerVolume.isParam && scorerVolume.parameterisation.type === 'PHANTOM') volume = 'cell-' + volume; 
			//commands.push('#Scorer ' + scorer.name);
			if(volumeScorerList.indexOf(volume)<0) {
				volumeScorerList.push(volume);
				var mfdetector = 'mf-'+scorer.name,
					mfString = '/gamos/scoring/createMFDetector '+mfdetector+' '+volume;
				mfdList[volume] = mfdetector;
				commands.push(mfString);
			}
				    
			if(scorer.data.gamosName === 'GmPSSurfaceFlux'){
				var direction = scorer.data.fluxType,
					surfaceList = scorer.data.surfaceList;
				// /gamos/setParam myScorer:Direction Out
				var	directionString = '/gamos/setParam ' + scorer.name + ':Direction '+ direction;
				 
				// /gamos/setParam myScorer1:Surfaces X+
				var surfaceString = '/gamos/setParam ' + scorer.name + ':Surfaces ';
				for(var i=0;i<surfaceList.length;i++)
					surfaceString += surfaceList[i]+' ';
				
				commands.push(directionString,surfaceString);
			}
		
			var addScorerMFString = '/gamos/scoring/addScorer2MFD ' + scorer.name + ' ' + scorer.data.gamosName + ' ' + mfdList[volume];
			
			if(scorer.data.gamosName === 'GmG4PSTrackLength' || scorer.data.gamosName === 'GmG4PSPassageTrackLength'){
				addScorerMFString +=  ' ' + 'FALSE' + ' ' + 'FALSE';
			}
				
			commands.push(addScorerMFString);
			
			//filters
			if(typeof scorer.filterList != 'undefined' && scorer.filterList !== null && scorer.filterList.length>0){
				var filtersCommand = [];
				for(var i=0;i<scorer.filterList.length;i++){
					var lineFilter = '/gamos/scoring/addFilter2Scorer ' + scorer.filterList[i].name + ' ' + scorer.name;
					filtersCommand.push(lineFilter);
				}
				commands = commands.concat(filtersCommand);
			}
				
			//classifiers
			// /gamos/classifier ClassifierByParticleAndProcess GmCompoundClassifier GmClassifierByParticle GmClassifierByProcess
			if(typeof scorer.classifierList != 'undefined' && scorer.classifierList !== null && scorer.classifierList.length>0){
				var classifierName = 'classifier-'+scorer.name;
				var classifierString = '/gamos/classifier '+classifierName+' GmCompoundClassifier ';
				for(var i=0;i<scorer.classifierList.length;i++){
					classifierString = classifierString + scorer.classifierList[i].gamosName + ' ';
				}
				commands.push(classifierString);
				var lineClassifier = '/gamos/scoring/assignClassifier2Scorer ' + classifierName + ' ' + scorer.name; 
				commands.push(lineClassifier);
			}
			
			//printer
			// /gamos/scoring/printer myprinterText GmPSPrinterTextFile
			// /gamos/setParam energiaprinterText:FileName salidaScorer.out
			// /gamos/scoring/addPrinter2Scorer myprinterText myScorer
			var printer = 'printer-' + scorer.name,
				file = scorer.name,
				linePrinter1 = '/gamos/scoring/printer ' + printer + ' GmPSPrinterTextFile',
				linePrinter2 = '/gamos/setParam ' + printer + ':FileName ' + file + '.out',
				linePrinter3 = '/gamos/scoring/addPrinter2Scorer '+ printer + ' ' + scorer.name;
			
			commands.push(linePrinter1,linePrinter2,linePrinter3);
							
			macroCommand = macroCommand.concat(commands);
		});
			
		//return commands;
		return macroCommand;
	}
	
	
	var buildFilter = function(filterJSON){
		var name = filterJSON.name,
			gamosName = filterJSON.gamosName,
			parameters = filterJSON.parameters,
			definitionString = '/gamos/filter ' + name + ' ' + gamosName + ' ';
			
		var paramString = '';
		
		for(var i=0;i<parameters.length;i++){
			var uString = '';
			if(typeof parameters[i].units != 'undefined') uString = '*' + parameters[i].units;
			 
			paramString = paramString + parameters[i].value + uString + ' ';
		}
		
		definitionString = definitionString + paramString;
		
		
		return definitionString;
		
	}
	
	var buildMacroFile = function(expJSON){
		var volumeList = expJSON.geometry.volumeList,
		sourceList = expJSON.sourceList,
		actionList = expJSON.data.actionList,
		scorerList = expJSON.data.scorerList,
		measurement = expJSON.data.measurement,
		filterList = expJSON.data.filterList,
		isPythia = expJSON.isPythia,
		nBeams = expJSON.nBeams;
	
		var macroArray = [];
		
		//Build header
		var header = buildHeader(expJSON);
		macroArray = macroArray.concat(header);
		
		//Build sources
		if(isPythia){
			// /generator/hepmcAscii/open outHepMC.data
			// /generator/hepmcAscii/verbose 1
			var pythiaOutDataFile = expJSON.pythiaData.pythiaOutDataFile,
				hepMCString = '/generator/hepmcAscii/open ' + pythiaOutDataFile,
				hepVerboseString = '/generator/hepmcAscii/verbose ' + 0;
			
			macroArray.push('#Pythia generator event');
			macroArray.push(hepMCString,hepVerboseString);
	
		}else{
			for(var i=0;i<sourceList.length;i++){
				var commandSource = buildSource(sourceList[i]);
				macroArray = macroArray.concat(commandSource);
				
			}
		}
		
		//Build filters
		for(var i=0;i<filterList.length;i++){
			var commandFilter = buildFilter(filterList[i]);
			macroArray.push('#Filter '+filterList[i].name);
			macroArray = macroArray.concat(commandFilter);
		}
		
		//Build GAMOS data
		for(var i=0;i<actionList.length;i++){
			var commandAction = buildGAMOSData(actionList[i]);
			macroArray.push('#GAMOS Data '+actionList[i].name);
			macroArray = macroArray.concat(commandAction);
		}
		
		//Build scorers
		var commandScorers = buildScorers(scorerList,volumeList);
		macroArray = macroArray.concat(commandScorers);
		
		//Add n beams
		var nBeamsString = '/run/beamOn ';
		if(isPythia) nBeamsString += 1;
		else {
			if(nBeams > Number.MAX_SAFE_INTEGER){
				nBeams = Number.MAX_SAFE_INTEGER - 1;
			} 
			nBeamsString += nBeams;
		}
	
		macroArray.push(nBeamsString);
		
		return macroArray;
		
	}
	
	return {
		'buildHeader': buildHeader,
		'buildGAMOSData': buildGAMOSData,
		'buildScorers': buildScorers,
		'buildFilter': buildFilter,
		'buildSource': buildSource,
		'buildMacroFile': buildMacroFile
	}
	
});
