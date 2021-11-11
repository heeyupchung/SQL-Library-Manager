var express = require("express");
var router = express.Router();
const Book = require("../models").Book;
const { Op } = require("sequelize");

function asyncHandler(cb) {
	return async (req, res, next) => {
		try {
			await cb(req, res, next);
		} catch (error) {
			next(error);
		}
	};
}

/* GET home page. */
router.get("/", (req, res) => {
	return res.redirect("/books");
});

/* GET books */
router.get(
	"/books",
	asyncHandler(async (req, res) => {
		const page = parseInt(req.query.page);
		!page || page <= 0 ? res.redirect("?page=1") : null;
		const limit = 5;

		const { count, rows } = await Book.findAndCountAll({
			order: [["title", "ASC"]],
			limit,
			offset: (page - 1) * limit,
		});

		const pages = Math.ceil(count / limit);
		page > pages ? res.redirect(`?page=${pages}`) : null;
		let pageLinks = 1;
		res.render("index", { books: rows, pages, pageLinks });
	})
);

/* GET searched books */
router.get(
	"/books/search",
	asyncHandler(async (req, res, next) => {
		const term = req.query.term.toLowerCase();
		const page = parseInt(req.query.page);
		!page || page <= 0 ? res.redirect(`search?term=${term}&page=1`) : null;
		const limit = 5;
		const { count, rows } = await Book.findAndCountAll({
			where: {
				[Op.or]: [
					{
						title: { [Op.like]: `%${term}%` },
					},
					{
						author: { [Op.like]: `%${term}%` },
					},
					{
						genre: { [Op.like]: `%${term}%` },
					},
					{
						year: { [Op.like]: `%${term}%` },
					},
				],
			},
			order: [["title", "ASC"]],
			limit,
			offset: (page - 1) * limit,
		});
		if (count > 0) {
			let pageLinks = 1;
			const pages = Math.ceil(count / limit);
			page > pages ? res.redirect(`?term=${term}&pages=${pages}`) : null;
			res.render("index", { books: rows, pages, pageLinks, term });
		} else {
			res.render("no-return", { term });
		}
	})
);

/* GET new book */
router.get(
	"/books/new",
	asyncHandler(async (req, res) => {
		res.render("new-book");
	})
);

/* POST new book */
router.post(
	"/books/new",
	asyncHandler(async (req, res) => {
		let book;
		try {
			const book = await Book.create(req.body);
			res.redirect("/books");
		} catch (error) {
			if (error.name === "SequelizeValidationError") {
				book = await Book.build(req.body);
				res.render("new-book", {
					book,
					errors: error.errors,
					title: "New Book",
				});
			} else {
				throw error;
			}
		}
	})
);

/* GET specific book */
router.get(
	"/books/:id",
	asyncHandler(async (req, res, next) => {
		const book = await Book.findByPk(req.params.id);
		if (book) {
			res.render("update-book", { book, title: "Edit Book" });
		} else {
			const err = new Error();
			err.status = 404;
			err.message = "Looks like that book doesn't exist.";
			next(err);
		}
	})
);

/* POST specific book */
router.post(
	"/books/:id",
	asyncHandler(async (req, res) => {
		let book;
		try {
			book = await Book.findByPk(req.params.id);
			if (book) {
				await book.update(req.body);
				res.redirect("/books");
			} else {
				res.sendStatus(404);
			}
		} catch (error) {
			if (error.name === "SequelizeValidationError") {
				book = await Book.build(req.body);
				book.id = req.params.id;
				res.render("update-book", {
					book,
					errors: error.errors,
					title: "Update Book",
				});
			} else {
				throw error;
			}
		}
	})
);

/* Delete book */
router.post(
	"/books/:id/delete",
	asyncHandler(async (req, res) => {
		const book = await Book.findByPk(req.params.id);
		if (book) {
			await book.destroy();
			res.redirect("/books");
		} else {
			res.sendStatus(404);
		}
	})
);

module.exports = router;
