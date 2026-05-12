const { app, BrowserWindow, Menu, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const http = require('http')

let mainWindow = null
let serverProcess = null
let loadingWindow = null

const isDev = !app.isPackaged
const SERVER_PORT = 3000
const SERVER_URL = `http://localhost:${SERVER_PORT}`

// ============================================================
// DATABASE - stored in user's app data directory
// ============================================================
function getDatabasePath() {
  return path.join(app.getPath('userData'), 'goldgem-erp.db')
}

function getDatabaseUrl() {
  return `file:${getDatabasePath()}`
}

function isDatabaseInitialized() {
  return fs.existsSync(getDatabasePath())
}

// ============================================================
// COPY PRE-SEEDED DATABASE FROM RESOURCES
// ============================================================
function initializeDatabase() {
  const dbPath = getDatabasePath()

  if (fs.existsSync(dbPath)) {
    console.log('[DB] Database already exists at:', dbPath)
    return
  }

  console.log('[DB] First run - copying pre-seeded database...')

  // Ensure the user data directory exists
  const userDataDir = app.getPath('userData')
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true })
  }

  // Copy the pre-seeded database from resources
  let seedDbPath
  if (isDev) {
    // Development: use the seed database from project's db/ folder
    seedDbPath = path.join(__dirname, '..', 'db', 'goldgem-erp-seed.db')
  } else {
    // Production: use from resources
    seedDbPath = path.join(process.resourcesPath, 'db', 'goldgem-erp-seed.db')
  }

  if (fs.existsSync(seedDbPath)) {
    fs.copyFileSync(seedDbPath, dbPath)
    console.log('[DB] Pre-seeded database copied to:', dbPath)
  } else {
    console.warn('[DB] Pre-seeded database not found at:', seedDbPath)
    console.warn('[DB] The database will be created automatically by Prisma on first connection')
    // Create an empty file so SQLite can initialize
    // Prisma will auto-create tables when it connects
  }
}

// ============================================================
// WAIT FOR SERVER
// ============================================================
function waitForServer(maxRetries = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0

    function check() {
      http.get(`${SERVER_URL}/api/dashboard`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(true)
        } else {
          retries++
          if (retries >= maxRetries) {
            reject(new Error('Server did not become ready'))
          } else {
            setTimeout(check, interval)
          }
        }
      }).on('error', () => {
        retries++
        if (retries >= maxRetries) {
          reject(new Error('Server did not become ready'))
        } else {
          setTimeout(check, interval)
        }
      })
    }

    check()
  })
}

// ============================================================
// START NEXT.JS SERVER
// ============================================================
function startServer() {
  return new Promise((resolve, reject) => {
    const dbUrl = getDatabaseUrl()
    console.log('[Server] Starting...')
    console.log('[Server] Database URL:', dbUrl)

    if (isDev) {
      // Development: use `next dev`
      const nextBin = path.join(__dirname, '..', 'node_modules', '.bin', 'next')
      serverProcess = spawn(nextBin, ['dev', '-p', String(SERVER_PORT)], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: dbUrl, NODE_ENV: 'development' }
      })
    } else {
      // Production: use the standalone server
      const appPath = path.join(process.resourcesPath, 'app')
      const standalonePath = path.join(appPath, '.next', 'standalone')
      const serverPath = path.join(standalonePath, 'server.js')

      console.log('[Server] Standalone path:', standalonePath)
      console.log('[Server] Server.js path:', serverPath)

      if (!fs.existsSync(serverPath)) {
        console.error('[Server] server.js not found at:', serverPath)
        reject(new Error('Server files not found. The application may be corrupted.'))
        return
      }

      // Use Electron's Node.js to run the standalone server
      serverProcess = spawn(process.execPath, [serverPath], {
        cwd: standalonePath,
        stdio: 'pipe',
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
          HOSTNAME: '127.0.0.1',
          PORT: String(SERVER_PORT),
          NODE_ENV: 'production'
        }
      })
    }

    serverProcess.stdout?.on('data', (data) => {
      console.log('[Server]', data.toString().trim())
    })

    serverProcess.stderr?.on('data', (data) => {
      const msg = data.toString().trim()
      // Filter out common non-error messages
      if (msg && !msg.includes('ExperimentalWarning') && !msg.includes('DeprecationWarning')) {
        console.error('[Server]', msg)
      }
    })

    serverProcess.on('error', (err) => {
      console.error('[Server] Failed to start:', err)
      reject(err)
    })

    serverProcess.on('exit', (code, signal) => {
      console.log(`[Server] Exited with code ${code}, signal ${signal}`)
      serverProcess = null
    })

    // Wait for server to be ready
    waitForServer(isDev ? 60 : 30, 1000)
      .then(() => {
        console.log('[Server] Ready!')
        resolve(true)
      })
      .catch(reject)
  })
}

// ============================================================
// LOADING WINDOW
// ============================================================
function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    show: true,
  })

  const loadingHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 500px;
        height: 350px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #e8d5b7;
        overflow: hidden;
      }
      .logo {
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 3px;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #d4a843 0%, #f0d68a 50%, #d4a843 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .subtitle {
        font-size: 13px;
        color: #8a8a9a;
        margin-bottom: 40px;
        letter-spacing: 2px;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(212, 168, 67, 0.2);
        border-top: 3px solid #d4a843;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .status {
        font-size: 12px;
        color: #6a6a7a;
        letter-spacing: 1px;
      }
    </style>
  </head>
  <body>
    <div class="logo">GOLDGEM</div>
    <div class="subtitle">JEWELLERY ERP SYSTEM</div>
    <div class="spinner"></div>
    <div class="status">Initializing...</div>
  </body>
  </html>
  `

  loadingWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`)

  loadingWindow.on('closed', () => {
    loadingWindow = null
  })
}

// ============================================================
// MAIN WINDOW
// ============================================================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Goldgem ERP - Jewellery Business Management',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    backgroundColor: '#0f172a',
  })

  // Remove default menu bar
  Menu.setApplicationMenu(null)

  // Load the app
  mainWindow.loadURL(SERVER_URL)

  mainWindow.once('ready-to-show', () => {
    // Close loading window
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.close()
    }
    mainWindow.show()
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.startsWith(SERVER_URL)) {
      return { action: 'allow' }
    }
    require('electron').shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(SERVER_URL) && !url.startsWith('http://localhost')) {
      event.preventDefault()
      require('electron').shell.openExternal(url)
    }
  })
}

// ============================================================
// APP LIFECYCLE
// ============================================================
app.whenReady().then(async () => {
  console.log('========================================')
  console.log('  Goldgem ERP - Starting...')
  console.log('========================================')
  console.log('[Main] Mode:', isDev ? 'Development' : 'Production')
  console.log('[Main] Platform:', process.platform)
  console.log('[Main] User Data:', app.getPath('userData'))

  // Show loading screen
  createLoadingWindow()

  try {
    // Step 1: Initialize database (copy pre-seeded DB on first run)
    initializeDatabase()
    console.log('[Main] Database path:', getDatabasePath())

    // Step 2: Start the Next.js server
    await startServer()
    console.log('[Main] Server started successfully')

    // Step 3: Create main window
    createWindow()

  } catch (err) {
    console.error('[Main] Startup failed:', err)

    // Close loading window
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.close()
    }

    // Show error dialog
    dialog.showErrorBox(
      'Goldgem ERP - Startup Error',
      `Failed to start the application.\n\nError: ${err.message}\n\nPlease try restarting the application.`
    )
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    console.log('[Main] Stopping server...')
    serverProcess.kill('SIGTERM')
    // Force kill after 5 seconds if not dead
    setTimeout(() => {
      if (serverProcess) {
        serverProcess.kill('SIGKILL')
        serverProcess = null
      }
    }, 5000)
  }
})

process.on('uncaughtException', (error) => {
  console.error('[Main] Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled Rejection:', reason)
})
