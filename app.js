const express = require('express')
const crypto = require('node:crypto')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')

const app = express()
const port = 3000

const sequelize = new Sequelize('sqlite:boards.db')

const Board = sequelize.define('Board', {
	id: { type: DataTypes.STRING, primaryKey: true },
})

const Player = sequelize.define('Player', {
	id: { type: DataTypes.STRING, primaryKey: true },
	boardId: { type: DataTypes.STRING, allowNull: false },
	name: { type: DataTypes.STRING, allowNull: false },
	color: { type: DataTypes.STRING, allowNull: false, defaultValue: 'gray' },
	points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
})

const Chore = sequelize.define('Chore', {
	id: { type: DataTypes.STRING, primaryKey: true },
	boardId: { type: DataTypes.STRING, allowNull: false },
	name: { type: DataTypes.STRING, allowNull: false },
	points: { type: DataTypes.INTEGER, allowNull: false },
})

sequelize.sync()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'pug')

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/boards/:boardId', async (req, res) => {
	const { boardId } = req.params
	const board = await Board.findByPk(boardId)
	if (!board) {
		res.render('index')
	}
	const players = await Player.findAll({ where: { boardId } })
	const chores = await Chore.findAll({ where: { boardId } })
	res.render('board', { board, players, chores })
})

app.post('/boards', async (req, res) => {
	const id = crypto.randomUUID()
	await Board.create({ id })
	res.redirect(`/boards/${id}`)
})

app.post('/boards/:boardId/players', async (req, res) => {
	const id = crypto.randomUUID()
	const { boardId } = req.params
	const { name, color } = req.body
	await Player.create({ id, boardId, name, color, points: 0 })
	const players = await Player.findAll({ where: { boardId } })
	res.render('manage-players-list', { players })
})

app.post('/boards/:boardId/chores', async (req, res) => {
	const id = crypto.randomUUID()
	const { boardId } = req.params
	const { name, points } = req.body
	await Chore.create({ id, boardId, name, points })
	const chores = await Chore.findAll({ where: { boardId } })
	res.render('manage-chores-list', { chores })
})

app.put('/manage-players/:playerId', async (req, res) => {
	const { playerId } = req.params
	const { color, name, points } = req.body
	const player = await Player.findByPk(playerId)
	await player.update({ color, name, points })
	const players = await Player.findAll({ where: { boardId: player.boardId } })
	res.render('manage-players-list', { players })
})

app.put('/manage-chores/:choreId', async (req, res) => {
	const { choreId } = req.params
	const { name, points } = req.body
	const chore = await Chore.findByPk(choreId)
	await chore.update({ name, points })
	const chores = await Chore.findAll({ where: { boardId: chore.boardId } })
	res.render('manage-chores-list', { chores })
})

app.delete('/manage-players/:playerId', async (req, res) => {
	const { playerId } = req.params
	const player = await Player.findByPk(playerId)
	await player.destroy();
	const players = await Player.findAll({ where: { boardId: player.boardId } })
	res.render('manage-players-list', { players })
})

app.delete('/manage-chores/:choreId', async (req, res) => {
	const { choreId } = req.params
	const chore = await Chore.findByPk(choreId)
	await chore.destroy();
	const chores = await Chore.findAll({ where: { boardId: chore.boardId } })
	res.render('manage-chores-list', { chores })
})

app.post('/chores', async (req, res) => {
	const id = crypto.randomUUID()
	const { boardId, name, points } = req.body
	await Chore.create({ id, boardId, name, points })
	const chores = await Chore.findAll({ where: { boardId } })
	res.render('chores-list', { chores })
})

app.post('/do-chore', async (req, res) => {
	const { playerId, choreId } = req.body
	const chore = await Chore.findByPk(choreId)
	const player = await Player.findByPk(playerId)
	await player.update({ points: player.points + chore.points })
	const players = await Player.findAll({ where: { boardId: player.boardId } })
	res.render('players', { players })
})

app.get('/boards/:boardId/players', async (req, res) => {
	const { boardId } = req.params
	const players = await Player.findAll({ where: { boardId } })
	res.render('players', { players })
})

app.get('/boards/:boardId/chores', async (req, res) => {
	const { boardId } = req.params
	const chores = await Chore.findAll({ where: { boardId } })
	res.render('chores-list', { chores })
})

app.get('/node_modules/**', async (req, res) => {
	res.sendFile(req.path, { root: __dirname })
})

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`)
})

