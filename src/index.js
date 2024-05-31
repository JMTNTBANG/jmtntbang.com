const express = require("express");
const session = require("express-session");
const http = require("http");
const https = require("https");
const fs = require("fs")



// Web Server Initialization
const website = express();
website.use(
  session({ secret: "secret", resave: true, saveUninitialized: true })
);
website.use(express.json());
website.use(express.urlencoded({ extended: true }));
website.use(express.static(`${__dirname}static`));
website.get("/", (req, page) => {
    page.writeHead(200, {"Content-Type": "text/html"});
    page.write(fs.readFileSync(`${__dirname}/index.html`));
    page.end()
})
website.get("/styles.css", (req, page) => {
    page.writeHead(200, {"Content-Type": "text/css"});
    page.write(fs.readFileSync(`${__dirname}/styles.css`));
    page.end()
})
website.get("/fixedsys.ttf", (req, page) => {
    page.sendFile(`${__dirname}/fixedsys.ttf`)
})
website.get("/apps", (req, page) => {
    let payload = fs.readFileSync(`${__dirname}/apps.html`)
    for (appDir of fs.readdirSync(`${__dirname}/apps/`)) {
        payload += `<a href = 'apps/${require(`./apps/${appDir}/package.json`).name}'><div class = 'largeButton', style = 'background-color: #bebebe; margin: 25px; color: #000000; text-decoration: none;'><br><p style = 'font-size: 50px; text-align: center; vertical-align: middle;'>${require(`./apps/${appDir}/package.json`).name}</p></div></a>`
    }
    payload += '</div></body>'
    page.send(payload)
})

for (appDir of fs.readdirSync(`${__dirname}/apps/`)) {
    let app = require(`${__dirname}/apps/${appDir}/src/index.js`);
    app.init(`/apps/${require(`./apps/${appDir}/package.json`).name}/`, website);
}

try {
  https
    .createServer(
      {
        key: fs.readFileSync(`${config.ssl}/privkey.pem`, "utf8"),
        cert: fs.readFileSync(`${config.ssl}/cert.pem`, "utf8"),
        ca: fs.readFileSync(`${config.ssl}/chain.pem`, "utf8"),
      },
      website
    )
    .listen(443, () => {
      console.log("HTTPS Server running on port 443");
    });
} catch {
  console.log("Caution: Connections will not be secured");
}
const httpServer = http.createServer(website);
httpServer.listen(8080, () => {
  console.log("HTTP Server running on port 8080");
});
