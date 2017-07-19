

var newman = require('newman'),
fs = require("fs"),
people = require(__dirname+'/Email.js'),
_ = require('lodash'),
TS_SEP = '-';




//provide time stamp in date formate 
timestamp = function (date, separator) {
        // use the iso string to ensure left padding and other stuff is taken care of
        return (date || new Date()).toISOString().replace(/[^\d]+/g, _.isString(separator) ? separator : TS_SEP);
};



run= function(){
	var postmanobject=require(__dirname+'/postman.json');
	var postmanProject=postmanobject.project;
	var collectionsArray=postmanobject.scripts;

	collectionsArray.forEach(function(collectionName){
		start(postmanProject,collectionName);
	})
};

start= function(project,collectionName){
	console.log('started')
	newman.run({
    collection: require(__dirname+'/'+project+'/'+collectionName+'.postman_collection.json'),
reporters: 'html',
    reporter: { 
	html : { 
			export : __dirname+'/'+project+'/newman/'+collectionName+'-'+timestamp()+'0.html'
	} 
} 
}, function (err,summary) {
    if (err) { throw err; }
    console.log(collectionName+' collection run complete!');
       reportEmailSummary={
         total : summary.run.stats.testScripts.total,
         failed : summary.run.stats.testScripts.failed,
         passed : summary.run.stats.testScripts.total - summary.run.stats.testScripts.failed
     }; 
     console.log(reportEmailSummary); 
//people.shootEmail(project+'/newman',reportEmailSummary);
});
}
run();

