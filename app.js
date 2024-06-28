require('dotenv').config()
const express = require('express')
const crypto = require('node:crypto')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')

const randomID = () => crypto.randomBytes(9).toString('base64url')

const app = express()
const port = process.env.PORT || 3000

const sequelize = new Sequelize({
	dialect: 'mysql',
	database: process.env.DB_DATABASE || 'choreboard',
	username: process.env.DB_USERNAME || 'choreboard',
	password: process.env.DB_PASSWORD || 'password',
})

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

function getAllPlayers(boardId) {
	return Player.findAll({ where: { boardId }, order: [['name', 'ASC']] })
}

function getAllChores(boardId) {
	return Chore.findAll({ where: { boardId }, order: [['name', 'ASC']] })
}

re_integer = /^\s*-?[0-9]+\s*$/

// BOARDS

app.get('/boards/:boardId', async (req, res) => {
	const { boardId } = req.params
	const board = await Board.findByPk(boardId)
	if (!board) {
		res.render('index')
	}
	const players = await getAllPlayers(boardId)
	const chores = await getAllChores(boardId)
	res.render('board', { board, players, chores })
})

app.post('/boards', async (req, res) => {
	const id = randomID()
	await Board.create({ id })
	res.redirect(`/boards/${id}`)
})

// PLAYERS

app.post('/boards/:boardId/players', async (req, res) => {
	const id = randomID()
	const { boardId } = req.params
	const { name, color } = req.body
	await Player.create({ id, boardId, name, color, points: 0 })
	const players = await getAllPlayers(boardId)
	res.render('update-players', { players })
})

app.put('/manage-players/:playerId', async (req, res) => {
	const { playerId } = req.params
	const { color, name, points } = req.body

	if (points != null && !re_integer.test(points)) {
		res.status(400)
		res.send('Bad points value')
		return
	}

	if (name != null && name.length < 1) {
		res.status(400)
		res.send('Bad name value')
		return
	}

	const player = await Player.findByPk(playerId)
	await player.update({ color, name, points })
	const players = await getAllPlayers(player.boardId)
	res.render('update-players', { players })
})

app.delete('/manage-players/:playerId', async (req, res) => {
	const { playerId } = req.params
	const player = await Player.findByPk(playerId)
	await player.destroy();
	const players = await getAllPlayers(player.boardId)
	res.render('update-players', { players })
})

app.post('/do-chore', async (req, res) => {
	const { playerId, choreId } = req.body
	const chore = await Chore.findByPk(choreId)
	const player = await Player.findByPk(playerId)
	await player.update({ points: player.points + chore.points })
	const players = await getAllPlayers(player.boardId)
	res.render('update-players', { players })
})

// CHORES

app.post('/boards/:boardId/chores', async (req, res) => {
	const id = randomID()
	const { boardId } = req.params
	const { name, points } = req.body
	await Chore.create({ id, boardId, name, points })
	const chores = await getAllChores(boardId)
	res.render('update-chores', { chores })
})

app.put('/manage-chores/:choreId', async (req, res) => {
	const { choreId } = req.params
	let { name, points } = req.body

	if (points != null && !re_integer.test(points)) {
		res.status(400)
		res.send('Bad points value')
		return
	}

	if (name != null && name.length < 1) {
		res.status(400)
		res.send('Bad name value')
		return
	}

	const chore = await Chore.findByPk(choreId)
	await chore.update({ name, points })
	const chores = await getAllChores(chore.boardId)
	res.render('update-chores', { chores })
})

app.delete('/manage-chores/:choreId', async (req, res) => {
	const { choreId } = req.params
	const chore = await Chore.findByPk(choreId)
	await chore.destroy();
	const chores = await getAllChores(chore.boardId)
	res.render('update-chores', { chores })
})

// STATIC + ROOT

app.get('/static/**', async (req, res) => {
	res.sendFile(req.path, { root: __dirname })
})

app.get('/', (req, res) => {
	res.render('index')
})

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`)
})
