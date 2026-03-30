import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const PORT = '8080'
const url = `http://localhost:${PORT}/build.html`

const serveProcess = spawn(
	'serve',
	['-l', PORT, '--no-port-switching', '.'],
	{ stdio: 'inherit' }
)

const openUrl = (targetUrl) => {
	if (process.platform === 'darwin') {
		return spawn('open', [targetUrl], { stdio: 'ignore', detached: true })
	}

	if (process.platform === 'win32') {
		return spawn('cmd', ['/c', 'start', '', targetUrl], { stdio: 'ignore', detached: true })
	}

	return spawn('xdg-open', [targetUrl], { stdio: 'ignore', detached: true })
}

const shutdown = (signal) => {
	if (!serveProcess.killed) {
		serveProcess.kill(signal)
	}
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

try {
	await delay(1000)
	const opener = openUrl(url)
	opener.unref()
} catch {
	console.log(`Open ${url}`)
}

serveProcess.on('exit', (code) => {
	process.exit(code ?? 0)
})
