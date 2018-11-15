"use strict"

lab.directive("consoleGamos", function($window,$rootScope,socket,buildMacro,buildGeom){
	
	function link(scope, element){
		
		$rootScope.termData.ptyCmd = {
        		'cmd': '',
        		'argv': []
        }
		
		let cmd = '';
		let pty;
		let prePrompt = 'PreInit>',
			postPrompt = 'Idle>',
			exitPrompt = '>',
			prompt = prePrompt;
		
		let shellCommand = '/control/shell';  
		
		let initConsole = false;
		if($rootScope.termData.term == null){
			$rootScope.termData.term = new Terminal({
        			cursorBlink: true,
        			rows: 32
        		}
        	);
        	
        	if ($rootScope.termData.term._initialized) {
        		    return;
        	}

        	$rootScope.termData.term._initialized = true;
        	 
        	$rootScope.termData.isActive = true;
        	        	
        		
        	$rootScope.termData.term.writePrompt = function () {
        		$rootScope.termData.term.write('\r' + $rootScope.termData.term.prompt + ' ');
    		};
    		
    		
    		$rootScope.termData.term.prompt = prePrompt;
    		
    		socket.emit('exp:InitConsole',null);
    		initConsole = true;
            
            $rootScope.termData.term.on('key', function (key, ev) {
            	
                let printable = (
                  !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey &&
                  (ev.keyCode != 37) && (ev.keyCode != 38) && (ev.keyCode != 39) && (ev.keyCode != 40 ) //&&
                  //(ev.keyCode != 45 ) && (ev.keyCode != 46 )
                  
                );

                if (ev.keyCode == 13) { 
                	
                  isError = false;
                  $rootScope.termData.term.writeln('');
                  
                  cmd = cmd.replace(/  +/g, ' ');
                  let cmdList = cmd.split(' ');
                  
                  if(cmdList == ""){
                	 $rootScope.termData.term.writePrompt(); 
                	  
                  } 
                  else{
                	  if(!_.includes(cmd,'/control/shell')){ // no ejecuta comandos del shell
                		  $rootScope.termData.ptyCmd = {
      	                		  'cmd': cmdList[0],
      	                		  'argv': cmdList.splice(1)
      	                  }
                     	  if($rootScope.termData.isActive){
                     		  
                     		  if($rootScope.termData.ptyCmd.cmd === 'clear'){
                     			  $rootScope.termData.term.reset();
                     			  $rootScope.termData.term.writePrompt();
                     		  }else{
                     			  
             	                  
             	                  if($rootScope.termData.ptyCmd.cmd === 'exit'){
             	                	  $rootScope.termData.pid = null;
             	                	  $rootScope.termData.isActive = false;
             	                	  $rootScope.termData.term.reset();
             	                	  $rootScope.termData.term.writeln('');
             	                	  $rootScope.termData.term.writeln('Geant4/GAMOS session closed');
             	                	  $rootScope.termData.term.writeln('Type gamos to reload the Geant4/GAMOS console.');
             	                	  $rootScope.termData.term.writeln('');
             	                	  $rootScope.termData.term.prompt = exitPrompt;
             	                	  
             	                	  $rootScope.termData.term.writePrompt();
             	                	  
             	                	  
             	                  }
             	                  
             	                  if($rootScope.termData.ptyCmd.cmd === '/control/execute'){
                     				  if($rootScope.isValidAll){
                     					 let macroCommands = buildMacro.buildMacroFile($rootScope.experiment);
                     					 let geomCommands = buildGeom.buildGeomCommands($rootScope.experiment.geometry.volumeList);
                     					 let commandList = {
                     							'macro': {
                     								'fileName': $rootScope.experiment.macroFile,
                     								'macroCommands': macroCommands
                     							},
                     							'geom': {
                     								'fileName': $rootScope.experiment.geomFile,
                     								'geomCommands': geomCommands
                     							},
                     							'nBeams': $rootScope.experiment.nBeams,
                     							'actionList': $rootScope.experiment.data.actionList,
                     							'scorerList': $rootScope.experiment.data.scorerList
                     						}
                     					  $rootScope.termData.ptyCmd.expJSON = commandList;
                 	                	  socket.emit('exp:Console',$rootScope.termData.ptyCmd);
                 	                	  
                     				  }
                     				  else{
                     					  $rootScope.termData.term.writeln('There are errors in experiment configuration');
                     					  $rootScope.termData.term.writeln('');
                     					  $rootScope.termData.term.writePrompt();  
                     				  }
             	                	 
             	                	  
             	                  }else{
             	                	  socket.emit('exp:Console',$rootScope.termData.ptyCmd);  
             	                  }
             	                   
                     		  }             		  
         	                  
                     		  
                     	  }// term isActive
                     	  else{
                     		  if($rootScope.termData.ptyCmd.cmd === 'gamos' && 
                     				  typeof $rootScope.termData.argv == 'undefined'){
                     			
                     			  $rootScope.termData.term.reset();
         	                      socket.emit('exp:InitConsole',null);
         	                      $rootScope.termData.isActive = true;
         	                	  $rootScope.termData.term.prompt = prePrompt;
         	                	  $rootScope.termData.term.writePrompt;
         	                  }
                     		  else{
                     			  
         	                	  $rootScope.termData.term.writeln('');
         	                	  $rootScope.termData.term.writeln('Please, type gamos if you want to reload the Geant4/GAMOS console');
         	                	  $rootScope.termData.term.writeln('');
         	                	  $rootScope.termData.term.writePrompt();
                     		  }
                     		 
                     	  }
     	            	   
                	  }// no shell command
                	  else{
                		  $rootScope.termData.term.writeln('');
 	                	  $rootScope.termData.term.writeln('You cannot execute shell commands');
 	                	  $rootScope.termData.term.writeln('');
 	                	  $rootScope.termData.term.writePrompt();
                		  
                	  }
                	  cmd = '';
                  }
                  
                }
                else if (ev.keyCode == 8) { 
                 // Do not delete the prompt
                	
                	let promptLength = $rootScope.termData.term.prompt.length + 1;
                	if ($rootScope.termData.term.x > promptLength) {
	                	$rootScope.termData.term.write('\b \b');
	                    cmd = cmd.substring(0, cmd.length - 1);
	                    
	                }
                }
                
                else if (printable) {

                  $rootScope.termData.term.write(key);
                  cmd +=key;
                }
             });
        }
        
       
		$rootScope.termData.term.open( element[0]);
		$rootScope.termData.term.fit();
		
        socket.on('exp:ConsolePid',(data)=>{
        	$rootScope.termData.pid = data;
        });
        
    	let isError = false;
        socket.on('exp:ErrorConsole',(data)=>{
        	isError = true;
        	$rootScope.termData.isActive = false;
        	scope.outData = data.errorData;
        	scope.$apply();
        	
        });
        
        
    	socket.on('exp:OutConsole',(data)=>{
    		scope.outData = data;
    		scope.$apply();
     		
    	});
        
    	scope.$watch('outData',(newData,oldData)=>{
    		if(typeof newData != 'undefined'){
    			if(newData != null){
    				
    				if($rootScope.termData.ptyCmd.cmd != 'exit'){
    					let miDataSplit = newData;
    	        		if(miDataSplit != null){
    	        			
    	        			miDataSplit = _.replace(miDataSplit,'\r','');
    	                    miDataSplit = miDataSplit.split('\n');
    	                    
    	                    let fullCmd = $rootScope.termData.ptyCmd.cmd;
    	                	if($rootScope.termData.ptyCmd.argv != null ){
    	                		for(let i=0;i<$rootScope.termData.ptyCmd.argv.length;i++){
    	                			fullCmd += ' ' + $rootScope.termData.ptyCmd.argv[i];
    	                		}
    	                	}
    	                	 
    	        			for(let i=0;i<miDataSplit.length;i++){
    	        				 
    	        				if(_.includes(miDataSplit[i], postPrompt)){
    	                			$rootScope.termData.term.prompt = postPrompt;
    	                		}
    	        				
    	        				
    	        				if(!_.includes(miDataSplit[i],$rootScope.termData.term.prompt)){
    	        					
    	        					//if(!_.includes(miDataSplit[i],fullCmd) || _.includes(miDataSplit[i],'command')){ 
    	        						
    	        						$rootScope.termData.term.writeln(miDataSplit[i]);
    	        					//} 
    	        						
    	        				} 
    	        				
    	        				if(_.includes(miDataSplit[i],$rootScope.termData.term.prompt)){
    	        					if(initConsole ){
    	        						$rootScope.termData.term.writeln('=============================================');
    	        						$rootScope.termData.term.writeln('If you want to execute the current experiment');
    	        						$rootScope.termData.term.writeln('type: /control/execute macro.in');
    	        						$rootScope.termData.term.writeln('=============================================');
        	        				}
    	        					$rootScope.termData.term.writePrompt();
    	        					initConsole = false;
    	        				} 
    	        				
    	        				
    	        			}
    	        			
    	        			
    	        		}
    	    			
    	        		if(isError){
    	        			$rootScope.termData.term.prompt = exitPrompt;
    	        			$rootScope.termData.pid = null;
    	                  	$rootScope.termData.isActive = false;
    	                  	$rootScope.termData.initTerm = true;
    	                  	//$rootScope.termData.term.reset();
    	          			$rootScope.termData.term.writeln('');
    	                  	$rootScope.termData.term.writeln('Geant4/GAMOS console closed');
    	                  	$rootScope.termData.term.writeln('Type gamos to reload the Geant4/GAMOS console.');
    	                  	$rootScope.termData.term.writeln('');
    	        			$rootScope.termData.term.writePrompt();
    	        				        				
	        			}
    	        		
    	    		}//if exit
    				
    			}
    		}
    		
    	},true);
    	
    	
    	
    	
    	scope.$watch('currentnode',(newNode,oldNode)=>{
    		if(newNode.isCopy){
    			let x = $rootScope.termData.term.prompt.length + 1;
    			let y = $rootScope.termData.term.y;
    			
    			$rootScope.termData.term.eraseRight(x, y);
    			$rootScope.termData.term.x = x;
    			$rootScope.termData.term.write(newNode.cmd);
    			cmd = newNode.cmd;
    			scope.currentnode.isCopy = false;
    		}
    	},true);
    	
        
    }
	
	return {
		link: link,
		restrict: 'AE',
		scope: { 
				currentnode: '='
			}
	}
  
});
