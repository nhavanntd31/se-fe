module.exports = {
  apps: [
    {
      name: 'gv',
      cwd: "YOUR_PROJECT_FOLDER",
      script: 'C:\\Program Files\\nodejs\\node.exe',   // explicitly use node.exe here
      args: [
        'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js',
        'run',
        'dev',
      ],
      exec_mode: 'fork',
    },
  ],
};