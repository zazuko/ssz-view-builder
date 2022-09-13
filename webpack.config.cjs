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
      devServer: {
        setup(app) {
          app.all('*', (req, res, next) => {
            if (!req.headers.authorization) {
              res.status(401)
              res.setHeader('WWW-Authenticate', 'Basic')
              res.end('Access denied')
              return
            }

            next()
          })
        }
      },
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
