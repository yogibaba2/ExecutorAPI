

var newman = require('newman'),
fs = require("fs"),
people = require(__dirname+'/Email.js'),
_ = require('lodash'),
TS_SEP = '-';
var postmanobject=require(__dirname+'/postman.json');
var emailObject=require(__dirname+'/../email.json');



//provide time stamp in date formate 
timestamp = function (date, separator) {
        // use the iso string to ensure left padding and other stuff is taken care of
        return (date || new Date()).toISOString().replace(/[^\d]+/g, _.isString(separator) ? separator : TS_SEP);
};



run= function(){
	
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
reporters: ['html','cli'],
    reporter: { 
	html : { 
			export : __dirname+'/'+project+'/newman/'+collectionName+'-'+timestamp()+'0.html',
			template: __dirname+'/report-template.hbs'
	} 
} 
}, function (err,summary) {
    if (err) { throw err; }
    console.log(collectionName+' collection run complete!');
        reportEmailSummary={
        request:summary.run.stats.requests,
        assertions:summary.run.stats.assertions
     }; 
     console.log(reportEmailSummary); 
     if(emailObject.emailDiv){
     	people.shootEmail(emailObject,project,reportEmailSummary);
     }

});
}
run();

