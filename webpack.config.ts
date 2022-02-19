import path from 'path'
import slsw from 'serverless-webpack'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import nodeExternals from 'webpack-node-externals'
import { Configuration } from 'webpack'

const config: Configuration = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  resolve: {
    extensions: ['.json', '.ts'],
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@repo': path.resolve(__dirname, './src/repositories'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@handlers': path.resolve(__dirname, './src/handlers'),
    },
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  externals: [nodeExternals()],
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { transpileOnly: true, configFile: 'tsconfig.json' },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: true,
      eslint: {
        enabled: true,
        files: './src/**/*.{ts,tsx}',
      },
    }),
  ],
}

module.exports = config
