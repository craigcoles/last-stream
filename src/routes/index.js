import express from "express";
var router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => res.render("index"));
router.get("/", (req, res, next) => {
	res.json("index", { title: "Express" });
});

export default router;
