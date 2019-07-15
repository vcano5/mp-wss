'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html')

var json = {"clientes": []};

const server = express()
	.use((req, res) => res.sendFile(INDEX) )
	.listen(PORT, () => console.log(`Listening on ${ PORT }`))

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
	ws.on('message', function incoming(data) {
		datoRecibido(ws, data)
	})
	generateID(function(id) {
		//console.log(ws)
		ws.id = id;
		crearParty(id, ws._socket.address().address, 777, 1);
		console.log('Cliente conectado');
		getJSONFromID(id, function(info) {
			enviarDatos(ws, 'info', info)
			//ws.send(info);
		})
	})
	ws.on('close', () => console.log('Cliente desconectado'))
})

function getJSONFromID(id, callback) {
	json.clientes.forEach(function(j) {
		if(j.id == id) {
			callback(JSON.stringify(j));
		}
	})
}

function generateID(callback) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var randomString = '';
	for(var i = 0; i < 8; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	callback(randomString);
};

function crearParty(id, ip, dueño, cuenta) {

	json.clientes[json.clientes.length] = JSON.parse('{"id": "' + id + '", "ip": "' + ip + '", "activo": 0, "miembros": [], "dueño": "' + dueño +'", "cuenta": "' + cuenta + '", "decoracion": {"color": "#999999"}, "type": "config"}')
};

function enviarDatos(ws, tipo, info) {

	ws.send(info)
}

function datoRecibido(ws, data) {
	var datos = JSON.parse(data)
	console.log('Recibi: ', datos);

}


// Desactivar 3 minutos despues
function noop() {}
function heartbeat(){this.isAlive = true;}
const interval = setInterval(function ping() {wss.clients.forEach(function each(ws){if(ws.isAlive===false) return ws.terminate();ws.isAlive=false;ws.ping(noop);console.log('Termine una sesion despues de 3 minutos de inactividad. ID: ' + ws.id)})}, 1800)