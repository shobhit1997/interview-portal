const app=require('./app');
const http=require('http');
const fs=require('fs');
// const config=require('./config/config');
const port=process.env.PORT||8000;
var server=http.createServer(app);
server.listen(port,function(){
	console.log("Server running at port "+port);
});

module.exports=server;