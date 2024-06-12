const express = require('express')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')

const app = express()
const port = 3000

const sequelize = new Sequelize('sqlite:boards.db')

const Board = sequelize.define('Board', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true
	}
})

const Player = sequelize.define('Player', {
	boardId: { type: DataTypes.STRING, allowNull: false},
	name: { type: DataTypes.STRING, allowNull: false},
	color: { type: DataTypes.STRING, allowNull: false},
	points: { type: DataTypes.INTEGER, allowNull: false},
})

const Chore = sequelize.define('Chore', {
	boardId: { type: DataTypes.STRING, allowNull: false},
	name: { type: DataTypes.STRING, allowNull: false},
	points: { type: DataTypes.INTEGER, allowNull: false},
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
	res.render('pages/index')
})

app.get('/b/:boardId', async (req, res) => {
	await sequelize.sync()
	const { boardId } = req.params
	const board = await Board.findByPk(boardId)
	const players = await Player.findAll({ where: { boardId }})
	const chores = await Chore.findAll({ where: { boardId }})

	res.render('pages/board', { players, chores })
})

app.post('/b', async (req, res) => {
	await sequelize.sync()
	const id = crypto.randomUUID()
	const board = await Board.create({ id })
	for (let i = 0; i < 10; i++) {
		const player = req.body[`player${i}`]
		if (player) {
			await Player.create({ boardId: id, name: player, color: 'gray', points: 0 })
		}
	}
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

