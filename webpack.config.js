const path = require('path');

module.exports = {
  entry: './src/index.js', // O ponto de entrada do seu aplicativo
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // O diretório de saída
  },
};

