var net = require("net");
var http = require("http");
var url = require("url");
var fs = require("fs");
var temp;

http
  .createServer(function (request, response) {
    var query = url.parse(request.url, true).query;
    response.writeHead(200, { "content-Type": "text/html" });
    console.log(JSON.stringify(query));
    if (JSON.stringify(query).length > 13) {
      fs.writeFile("temp.txt", JSON.stringify(query), "utf8", function (error) {
        console.log("write");
      });
    }
    fs.readFile("temp.txt", "utf8", function (error, data) {
      console.log(data);
      temp = data;
    });

    response.end(temp);
  })
  .listen(80, function () {});
