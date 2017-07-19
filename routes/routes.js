
var path    = require("path");
var appRouter= function(app,server){
	
	const WebSocket = require('ws');

	
	var projects = require('../projects');
	var pro = new projects();

	//root 
	app.get("/", function(req, res,next) {
		res.send("Hello World");
	});

	//webservices to experiment
	app.get("/exp/:name",function(req,res,next){
		console.log(req.name);
		res.send(req.name);
	});

	//parameterized services handle
	app.param('name',function(res,req,next,name){
		console.log('in param : '+name);
		req.name=name;
		next();
	});

	//webserice for to return project list for selenium and postman
	app.get("/projects",function(req,res,next){ 
		var projectType = req.query.projectType;
		console.log("project List requested for: "+projectType);
		if(projectType==='selenium'||projectType==='postman'){
			res.send(pro.getProjectList(projectType));
		}else{
			res.send({
				message : "no project found for request projectType"
			});
		}
		
		
	});

// a service that prepare testng.xml for specific script execution in selenium
	app.post("/createTestNg",function(req,res,next){
		console.log("request for a testNg file...");
		console.log(req.body);
		var package=req.body.package+'.'+req.body.project,
		scripts =req.body.scripts;
		res.send(pro.createTestNgXml(package,scripts));
		console.log('requested file created...');
	});

	// webservice to prepare postman.json to execute postman script
	app.post("/preparePostmanJson",function(req,res,next){
		console.log("request for postman Json file creation...");
		console.log(req.body);
		res.send(pro.preparePostmanJson(req.body));
		console.log('requested file created...');
	});

	app.post("/prepareEmailJson",function(req,res,next){
		console.log("request for email Json file creation...");
		console.log(req.body);
		res.send(pro.prepareEmailJson(req.body));
		console.log('requested file created...');
	});

	//webservice to get postman report list
	app.get("/reports/postman",function(req,res,next){
		console.log("reports requested for postman....")
		res.send(pro.getPostmanReports());
	});

	//webservice to view postman report
	app.get("/viewReport/postman",function(req,res,next){
		console.log("report requested for postman....")
		try{
			res.sendFile(path.join(__dirname+'/../projects/postman/'+req.query.project+'/newman/'+req.query.report+'.html'));
		}
		catch(e){
			res.send("file not found")
		}
	});

	//webservice to get selenium report list
	app.get("/reports/selenium",function(req,res,next){
		console.log("reports requested for selenium....")
		res.send(pro.getSeleniumReport());
	});

	//webservice to view selenium report list
	app.get("/viewReport/selenium",function(req,res,next){
		console.log("report requested for selenium....")
		try{
			res.sendFile(path.join(__dirname+'/../projects/selenium/automationBed-Beta/test-output/AdvanceReports/'+req.query.project+'/'+req.query.report+'.html'));
		}
		catch(e){
			res.send("file not found")
		}
	});

	app.post("/upload",function(req,res,next){
		if (!req.files)
	    return res.status(400).send('No files were uploaded.');
	 
	  	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
	  	let sampleFile = req.files.sampleFile;
	 	console.log(sampleFile);
		  // Use the mv() method to place the file somewhere on your server 
		sampleFile.mv('./'+sampleFile.name, function(err) {
		    if (err)
		      return res.status(500).send(err);
		 
			res.send('File uploaded!');
	    });
	});


// a web socket for communication to API (currrently using for execution.)
	const wss = new WebSocket.Server({ server: server,path:'/execute'});
	wss.on('connection', function connection(ws) {
			console.log('connected');
			/*var Scheduling = require('../projects/scheduling');
			var sch = new Scheduling()*/
			console.log('websocket configured....');
			ws.send('connection accepted');
			
			ws.on('message', function incoming(message) {
			console.log('received: %s', message);
				if(message=='selenium'){
					pro.commandExecutor(ws,'selenium');
				}else if(message=='postman'){
					pro.commandExecutor(ws,'postman');
				}

			});

	});

	 
}


module.exports=appRouter;