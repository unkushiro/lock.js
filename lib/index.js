'use strict'
const path = require('path')
const co = require('co')
const lockjs = require('commander')
const lock = require('./lock')
const unlock = require('./unlock')
const install = require('./install')
const utils = require('./utils')
const pkg = require('../package')

lockjs.version(pkg.version)

lockjs
  .command('lock <projectPath> <entryPoint> <dest>')
  .description('lock specified node.js project and generate a public key')
  .action(function (projectPath, entryPoint, dest) {
    co(lock(projectPath, dest, entryPoint)).catch(console.error)
  })

lockjs
  .command('gen <packedProject> <dest> <publicKey>')
  .description('generate a executable from the locked and the public key')
  .action(function (packedProject, dest, publicKey) {
    co(function * () {
      utils.check('clang')
      let version = yield install()

      let sharedLibDir = path.resolve(__dirname, `../dist/${version}/shared`)
      let headersDir = path.resolve(__dirname, `../dist/${version}/node-v${version}/include/node`)

      return unlock(packedProject, publicKey, dest, headersDir, sharedLibDir)
    }).catch(console.error)
  })

lockjs
  .command('install')
  .description('install latest node.js header files and shared library')
  .action(function () { co(install()).catch(console.error) })

lockjs.parse(process.argv)
