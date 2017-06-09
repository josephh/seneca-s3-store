'use strict'

var Assert = require('assert')

// Amazon
const AWS = require('aws-sdk')
var s3

var Eraro = require('eraro')({
  package: 'aws-s3' // (optional) String; package name to mark Error objects
})

const storeName = 'aws-s3-store'
const actionRole = 's3'

module.exports = function (opts) {
  var seneca = this

  // The store interface returned to seneca
  var store = {
    name: storeName,

    save: function (args, done) {
      console.log('in SAVE')
      Assert(args)
      Assert(done)

      done(null, 'save done')
    },

    // Close the connection
    close: function (cmd, cb) {
      console.log('in CLOSE')
      Assert(cb)
      cb()
    },

    // Return the underlying native connection object
    native: function (args, cb) {
      Assert(args)
      Assert(cb)

      cb()
    },

    load: function (args, done) {
      console.log('in LOAD')
      Assert(args)
      Assert(done)

      var keyName = 'hello_world.txt'
      var params = {Key: keyName, Body: 'Hello World'}
      s3.putObject(params, function (err, data) {
        if (err) {
          console.log(err)
        }
        else {
          console.log('Successfully uploaded data ')
          args.keyName = keyName
          seneca.act({role: actionRole, hook: 'load', target: store.name}, args, function (err, resp) {
            if (err) {
              seneca.log.error(err)
              return done(err, {code: 'load', store: store.name, error: err})
            }
            console.log(resp)
            done(null, {msg: 'load done'})
          })
        }
      })
    },

    list: function (args, done) {
      console.log('in LIST')
      Assert(args, 'args are TRUE')
      Assert(done, 'done is TRUE')

      done(null, 'list done')
    },

    remove: function (args, done) {
      console.log('in REMOVE')
      Assert(args, 'args are TRUE')
      Assert(done, 'done is TRUE')
      done(null, 'remove done')
    }

  }

  var meta = seneca.store.init(seneca, {}, store)
  seneca.add({init: store.name, tag: meta.tag}, function (args, done) {
    require('dotenv').config()
    var s3Config = new AWS.Config({
      accessKeyId: process.env.aws_access_key_id,
      secretAccessKey: process.env.aws_secret_access_key
      // TODO s3 config?
    })
    AWS.config.s3 = {params: {Bucket: process.env.bucket_name}}
    s3 = new AWS.S3(s3Config)
    done()
  })

  seneca.add({role: actionRole, hook: 'load'}, function (args, done) {
    var s3Params = {
      Key: args.keyName
    }
    s3.getObject(s3Params, function (err, data) {
      if (err) {
        throw Eraro({code: 'load/fail', store: store.name, error: err})
      }
      else {
        console.log('fetched s3 object')
        return done(null, {response: 'load action handled'})
      }
    })
  })

  return {name: store.name, tag: meta.tag}
}
