import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    quill: './src/quill.js'
  },
  output: {
    globalObject: 'self',
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].bundle.js',
    publicPath: '/dist/'
  },
  devServer: {
    static: path.join(__dirname) + '/public/',
    compress: true
  }
}
export default exports;