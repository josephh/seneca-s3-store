'use strict'

var Seneca = require('seneca')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
var Async = require('async')
var describe = lab.describe
var before = lab.before
var it = lab.it
var DbConfig = require('./default_config.json')

var Assert = require('chai').assert

var si = Seneca({
  default_plugins: {
    'mem-store': false
  }
})

if (si.version >= '2.0.0') {
  si.use('seneca-entity')
}

describe('s3', function () {
  before({}, function (done) {
    si.use(require('../lib/aws-s3-store.js'), DbConfig)
    si.ready(done)
    // TODO any pre-test setup???
  })

  it('loads an image file', function (done) {
    Async.series(
      {
        load: function (next) {
          var foo = si.make({name$: 'foo'})
          foo.load$({id: '1234'}, 0)
          // foo.load$({id: '1234'}, function (err, res) {
          //   Assert(!err)
          //   // Assert.isNotNull(res.id)
          //   next()
          // })
          console.log('some output')
          next()
        }
      },
      function (err, out) {
        Assert(!err)
        done()
      })
  })
})
