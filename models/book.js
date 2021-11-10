"use strict";
const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Book extends Model {}

	Book.init(
		{
			title: {
				type: Sequelize.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: "'Title' cannot be blank",
					},
				},
			},
			author: {
				type: Sequelize.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: "'Author' cannot be blank",
					},
				},
			},
			genre: Sequelize.STRING,
			year: Sequelize.INTEGER,
		},
		{
			sequelize,
		}
	);
	return Book;
};
