const http = require('http');
const https = require('https');

const app = require('./app');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

server.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

server.listen(process.env.PORT, () => {
	console.log('HTTPS Server running on port 443');
}); 

//server.listen(port);



