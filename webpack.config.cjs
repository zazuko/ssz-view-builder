/* eslint-disable import/no-extraneous-dependencies */
const { merge } = require('webpack-merge')
const { createDefaultConfig } = require('@open-wc/building-webpack')
const path = require("path")
const CopyPlugin = require("copy-webpack-plugin");

module.exports =
  merge(
    createDefaultConfig({
      input: path.resolve(__dirname, "./build/index.html")
    }),
    {
      resolve: {
        extensions: ['.ts', '.mjs', '.js', '.json'],
        alias: {
          stream: 'readable-stream',
        },
      },
      node: {
        crypto: true,
      },
      plugins: [
        new CopyPlugin({
          patterns: [
            { from: "**/*.turtle", to: 'dist', context: 'src/' },
            { from: "**/*.sparql", to: 'dist', context: 'src/' },
          ]
        })
      ]
    }
  )
