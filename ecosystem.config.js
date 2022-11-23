module.exports = {
  apps: [{
    name: "Hypixel Data Grabber",
    script: "./index.js",
    cwd: "./dist/",
    args: "--log --time",
    kill_timeout: 5000,
    shutdown_with_message: true // Windows
  }]
}
