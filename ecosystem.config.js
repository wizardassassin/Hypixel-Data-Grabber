module.exports = {
  apps: [{
    name: "Hypixel Data Grabber",
    script: "./index.js",
    cwd: "./dist/",
    time: true,
    log: true,
    kill_timeout: 5000,
    shutdown_with_message: false // Windows
  }]
}
