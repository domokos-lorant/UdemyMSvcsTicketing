module.exports = {
  webpackDevMiddleware: (config) => {
    // Next is finiky about picking up file changes automatically.
    // Set up file polling to fix that up.
    config.watchOptions.poll = 300;
    return config;
  },
}