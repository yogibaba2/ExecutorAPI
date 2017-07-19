var projects =function(){};
	
	var fs = require("fs"),
	path = require("path"),
	xmlBuilder=require('xmlbuilder');

	//return JSON object for project herarchy
	projects.prototype.getProjectList=function(projectType){
	 	var projectList={
			projects : []
		};
		var srcpath;

		if(projectType==='selenium'){
			projectList['projectType']=projectType;
			projectList['package'] = 'Ituple.automationBed_Beta';
			srcpath=__dirname+'/selenium/automationBed-Beta/src/test/java/Ituple/automationBed_Beta/';
		}else if(projectType==='postman'){
			projectList['projectType']=projectType;
			projectList['package'] = projectType;
			srcpath=__dirname+'/postman/';
		}

		

		getDirectories(srcpath)
		.forEach(function(proName){
			var project={};
			project['name']=proName;
			project['scripts']= [];
			getFiles(srcpath+proName+'/').forEach(function(script){
				var scr = script.split('.');
				if((scr[scr.length-1]).toUpperCase()=='JAVA' || (scr[scr.length-1]).toUpperCase()=='JSON'){
					project.scripts.push({'name' : scr[0]});
				}	
			});
			projectList.projects.push(project);
		});
		return projectList;
	};

	//creat testNg.xml for selenium
	projects.prototype.createTestNgXml = function(package,scripts){
		var testngContent= {test : {'@name' : 'test',classes : {class :[]}}}

		scripts.forEach(function(script){
			var classobj = {
				'@name' : package+'.'+script
			};
			testngContent.test.classes.class.push(classobj);
		});

		var writer = xmlBuilder.streamWriter(process.stdout);
		var root=xmlBuilder.create('suite',
							{version:'1.0',encoding:'UTF-8'},
							{pubID: null, sysID: "http://testng.org/testng-1.0.dtd"}).
							att('guice-stage', 'DEVELOPMENT').att('name','MRRTest').ele(testngContent);
		
		var xmlString = root.end({ 
			pretty: true,
			indent: '  ',
			newline: '\n',
			allowEmpty: false
		});

		fs.writeFile(__dirname+'/selenium/automationBed-Beta/testng.xml', xmlString, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		}); 
		return ("file created : \n"+xmlString);
	};

	projects.prototype.preparePostmanJson= function(obj){
		fs.writeFile(__dirname+'/postman/postman.json',  JSON.stringify(obj),'utf-8', function(err) {
		    if(err) {
		        return console.log(err);
		    }
		}); 
		return ("file created : \n"+ JSON.stringify(obj));
	}
	projects.prototype.prepareEmailJson= function(obj){
		fs.writeFile(__dirname+'/email.json',  JSON.stringify(obj),'utf-8', function(err) {
		    if(err) {
		        return console.log(err);
		    }
		}); 
		return ("file created : \n"+ JSON.stringify(obj));
	}


	//execute selenium and postman script
	projects.prototype.commandExecutor=function(ws,protype){

	 	var process = require('child_process');
	 	if(protype=='selenium'){
	 		process = process.exec('mvn -f projects/selenium/automationBed-Beta/pom.xml test',
			function (err,stdout,stderr) {

 			});
	 	}
		else if(protype=='postman'){
			process = process.exec('node "projects/postman/index1.js"',
			function (err,stdout,stderr) {

 			});
		}

	 	process.stdout.on('data', function(data) {
	 		console.log(data.toString());
			ws.send(data.toString());
		});
	}

	projects.prototype.getSeleniumReport=function(){
		return getReportsCommon('selenium');
	}

	var getReportsCommon = function(proType){
		var srcpath,pathExtension;
		if(proType==='postman'){
			srcpath=__dirname+'/postman/';
			pathExtension = /newman/
		}
		else if(proType==='selenium'){
			srcpath=__dirname+'/selenium/automationBed-Beta/test-output/AdvanceReports/';
			pathExtension='';
		}

		var commonReports={
			name :proType+"Reports",
			projects : []
		}

		

		getDirectories(srcpath)
		.forEach(function(proName){
			var project={};
			project['name']=proName;
			project['reports']= [];
			getFiles(srcpath+proName+pathExtension).forEach(function(report){
				var scr = report.split('.');
				if((scr[scr.length-1]).toUpperCase()=='HTML'){
					project.reports.push(
						{'name' : scr[0],
						'modified_on' : getFileAttr(srcpath+proName+pathExtension,report).ctime
						}
					);
				}	
			});
			commonReports.projects.push(project);
		});
		return commonReports;
	}

	//return JSON object for all reports for postman 
	projects.prototype.getPostmanReports=function(){
		return getReportsCommon('postman');
	}







	//return dir list should be moved to a common service module
	function getDirectories (scrPath) {
	  return fs.readdirSync(scrPath)
	    .filter(file => fs.statSync(path.join(scrPath, file)).isDirectory())
	}
	//return file list should be moved to a common service module
	function getFiles (scrPath) {
	  return fs.readdirSync(scrPath)
	    .filter(file => fs.statSync(path.join(scrPath, file)).isFile())
	}

	function getFileAttr(scrPath,file){
		return fs.statSync(path.join(scrPath, file));
	}

module.exports=projects;