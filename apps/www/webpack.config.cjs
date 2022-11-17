/* eslint-disable import/no-extraneous-dependencies */
const path = require('path')
const { merge } = require('webpack-merge')
const { createDefaultConfig } = require('@open-wc/building-webpack')
const Dotenv = require('dotenv-webpack')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = merge(
  createDefaultConfig({
    input: path.resolve(__dirname, './src/index.html'),
    output: {
      publicPath: '/app/',
    },
  }),
  {
    resolve: {
      extensions: ['.ts', '.mjs', '.js', '.json'],
      alias: {
        stream: 'readable-stream',
      },
    },
    module: {
      rules: [{
        test: /\.(ttl|nt|nq|rdf|jsonld|trig)$/,
        use: 'webpack-loader-rdf',
      }, {
        test: /\.(sparql|rq)$/,
        use: 'raw-loader',
      }],
    },
    node: {
      crypto: true,
    },
    devServer: {
      contentBase: '/app/',
    },
    plugins: [
      new Dotenv({
        path: '../../.env',
        systemvars: true,
      }),
      new CopyPlugin({
        patterns: [
          { from: '**/*.turtle', to: 'dist', context: 'src/' },
          { from: '**/*.sparql', to: 'dist', context: 'src/' },
        ],
      }),
    ],
  },
)
