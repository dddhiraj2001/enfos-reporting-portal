import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)))
const frontendDirectory = join(rootDirectory, 'frontend')
const backendDirectory = join(rootDirectory, 'backend')
const backendPort = readPort('BACKEND_PORT', '8080')
const frontendPort = readPort('FRONTEND_PORT', '4173')
const backendUrl = `http://127.0.0.1:${backendPort}`
const frontendUrl = `http://127.0.0.1:${frontendPort}`
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const mavenCommand = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw'
const children = new Set()
let shuttingDown = false

/** Reads an optional port override and fails early with a clear configuration message. */
function readPort(name, fallback) {
  const value = process.env[name] ?? fallback
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`)
  }
  return String(port)
}

/** Runs a build step to completion while preserving its native terminal output. */
function run(command, arguments_, workingDirectory, environment = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: workingDirectory,
      env: environment,
      stdio: 'inherit',
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} exited with ${signal ?? `code ${code}`}.`))
      }
    })
  })
}

/** Starts a long-running service and registers it for coordinated shutdown. */
function start(command, arguments_, workingDirectory, environment = process.env) {
  const child = spawn(command, arguments_, {
    cwd: workingDirectory,
    env: environment,
    stdio: 'inherit',
  })
  children.add(child)
  child.once('error', (error) => shutdown(1, error))
  child.once('exit', (code, signal) => {
    children.delete(child)
    if (!shuttingDown) {
      shutdown(code ?? 1, new Error(`${command} stopped with ${signal ?? `code ${code}`}.`))
    }
  })
  return child
}

/** Polls an HTTP endpoint so the command announces readiness only when the service responds. */
async function waitForReady(url, label, timeoutMilliseconds = 30_000) {
  const deadline = Date.now() + timeoutMilliseconds
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The service is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`${label} did not become ready at ${url}.`)
}

/** Locates the Maven-built executable without coupling the launcher to its version number. */
function findBackendJar() {
  const targetDirectory = join(backendDirectory, 'target')
  const jarFiles = readdirSync(targetDirectory)
    .filter((name) => name.endsWith('.jar') && !name.endsWith('.jar.original'))

  if (jarFiles.length !== 1) {
    throw new Error(`Expected one runnable backend JAR, found ${jarFiles.length}.`)
  }
  return join(targetDirectory, jarFiles[0])
}

/** Stops both child services when either exits or the user presses Control+C. */
function shutdown(exitCode = 0, error) {
  if (shuttingDown) return
  shuttingDown = true

  if (error) console.error(`\nStartup failed: ${error.message}`)
  for (const child of children) child.kill('SIGTERM')

  setTimeout(() => process.exit(exitCode), children.size === 0 ? 0 : 1_000)
}

/** Performs a reproducible install/build before starting the complete application. */
async function main() {
  if (!existsSync(join(frontendDirectory, 'package-lock.json'))) {
    throw new Error('frontend/package-lock.json is required for a reproducible install.')
  }

  console.log('\n[1/4] Installing locked frontend dependencies...')
  await run(npmCommand, ['ci'], frontendDirectory)

  console.log('\n[2/4] Building the React frontend...')
  await run(npmCommand, ['run', 'build'], frontendDirectory)

  console.log('\n[3/4] Building the Spring Boot backend...')
  await run(mavenCommand, ['clean', 'package', '-DskipTests'], backendDirectory)

  console.log('\n[4/4] Starting both applications...')
  start('java', ['-jar', findBackendJar(), `--server.port=${backendPort}`], backendDirectory)
  await waitForReady(`${backendUrl}/api/reports`, 'Backend')

  start(
    npmCommand,
    ['run', 'preview', '--', '--host', '127.0.0.1', '--port', frontendPort, '--strictPort'],
    frontendDirectory,
    { ...process.env, API_PROXY_TARGET: backendUrl },
  )
  await waitForReady(frontendUrl, 'Frontend')

  console.log('\nENFOS Reporting Portal is ready:')
  console.log(`  Application: ${frontendUrl}`)
  console.log(`  API:         ${backendUrl}/api/reports`)
  console.log('  Press Control+C to stop both applications.\n')
}

process.once('SIGINT', () => shutdown())
process.once('SIGTERM', () => shutdown())

main().catch((error) => shutdown(1, error))
