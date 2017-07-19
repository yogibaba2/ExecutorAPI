(function(){
	 	var process = require('child_process');
	 	

	 	process = process.exec('node projects/temp.js',function (err,stdout,stderr) {
 		});

 		'java -Dlog4j.configurationFile=file:scheduling/resources/log4j2-test.properties -jar "scheduling/schedulingRunner.jar"'

	 	process.stdout.on('data', function(data) {
			console.log(data.toString());
		});
})();