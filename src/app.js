//=== Dotenv Config
import { config } from "dotenv";
config();

import express from "express";
import expressWs from "express-ws";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import moment from "moment";
import { LastFmNode } from "lastfm";

import index from "./routes/index";

//=== Express Config
const app = express();

//=== Websocket Config
const socket = expressWs(app);
const broadcastChannel = socket.getWss("/");

//=== Stream Init
const lastfm = new LastFmNode({
	api_key: process.env.API_KEY,
	secret: process.env.API_SECRET
});
const stream = lastfm.stream(process.env.USERNAME);
stream.start();

//=== Setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

//=== Routes
const router = express.Router();

router.get("/", (req, res, next) => res.render("index"));

router.get("/recent", (req, res, next) => {
	const response = lastfm.request("user.getRecentTracks", {
		user: process.env.USERNAME,
		limit: 10
	});

	response.on("success", data => res.json(data));
	response.on("error", error => res.json(error));
});

app.use("/", router);

//=== Websockets
app.ws("/", () => {
	stream.on("nowPlaying", track => {
		if (track) {
			broadcastChannel.clients.forEach(client =>
				client.send(JSON.stringify({ event: "now-playing", track }))
			);
		}
	});
});

export default app;
