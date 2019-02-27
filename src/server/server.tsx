import * as path from "path";
import * as express from "express";
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'fs';
import { StaticRouter } from 'react-router-dom';
import App from '../client/ts/App';
import logger from "./log";

const opn = require('opn');

const app = express();
const router = express.Router();
router.get("/api", (req, res) => {
    res.json(null);
});

router.get("*", (req, res) => {
    const context = {} as any;
    const app = ReactDOMServer.renderToString(
        <StaticRouter location={req.url} context={context}>
            <App />
        </StaticRouter>
    );

    const indexFile = path.resolve(__dirname + "/../client/index.html");
    fs.readFile(indexFile, "utf8", (err, data) => {
        if (err) {
            logger.error("Could not read 'index.html':", err);
            return res.sendStatus(500);
        }

        if (context.status === 404) {
          res.status(404);
        }

        return res.send(
            data.replace("<div id=\"root\"></div>", `<div id="root">${app}</div>`)
        );
    });
});

// Store all HTML, JS and CSS files in client folder
app.use(express.static(path.resolve(__dirname + "/../client")));
// Add the router
app.use("/", router);

app.listen(process.env.PORT || 8080, () => logger.info(`Listening on port ${process.env.PORT || 8080}!`));

// Open the app in the default browser if not in production mode
if (process.env.NODE_ENV !== 'production') opn(`http://localhost:${process.env.PORT || 8080}`);
