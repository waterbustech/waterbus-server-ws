module.exports = {
    apps: [
      {
        name: "Websocket",
        script: "dist/src/main.js",
        instances: 1, // can set is "max" for using max of processors
        autorestart: true,
        watch: false,
        max_memory_restart: "2G",
        exec_mode: "cluster",
        env: {
          NODE_ENV: "production",
        },
        error_file: "logs/error.log",
        out_file: "logs/out.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss",
      },
    ],
  };
  