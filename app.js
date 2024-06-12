const express = require('express')
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize')

const app = express()
const port = 3000

const sequelize = new Sequelize('sqlite:boards.db')

const Board = sequelize.define('Board', {
	id: DataTypes.STRING
})

const Player = sequelize.define('Player', {
	boardId: DataTypes.STRING,
	name: DataTypes.STRING,
	color: DataTypes.STRING,
	points: DataTypes.INTEGER
})

const Chore = sequelize.define('Chore', {
	boardId: DataTypes.STRING,
	name: DataTypes.STRING,
	points: DataTypes.INTEGER
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('pages/index')
})

app.get('/:boardId', await (req, res) => {
	const { boardId } = req.params;
	const board = await Board.findByPk(boardId);
	const players = await Player.findAll({ where: { boardId }})
	const chores = await Chore.findAll({ where: { boardId }})

	res.render('pages/board', { players, chores })
})

app.post('/', (req, res) => {

})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

