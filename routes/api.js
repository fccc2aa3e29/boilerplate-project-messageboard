/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get((req, res) => {
    MongoClient.connect(process.env.DB, (err, client) => {
      client.db('test').collection('threads').find({}).project({reported: 0, delete_password: 0, 'replies.delete_password': 0, 'replies.reported': 0, replies: {$slice: -3}}).sort({bumped_on: -1}).limit(10).toArray((err, data) => {
        if (err) res.send(err);
        res.send(data);
        client.close();
      });
    });
    
  })
    
    .post((req, res) => {
    
    MongoClient.connect(process.env.DB, (err, client) => {
      const date = new Date();
      client.db('test').collection('threads').insertOne({text: req.body.text, created_on: date, bumped_on: date, reported: false, delete_password: req.body.delete_password, replies: [], replycount: 0}, (err, data) => {
        if (err) res.send(err);
        res.redirect(`/b/${req.body.board}`);
        client.close();
      });
    });
  })
    
    .put((req, res) => {
    
    MongoClient.connect(process.env.DB, (err, client) => {
      client.db('test').collection('threads').updateOne({_id: req.body.thread_id}, {$set: {reported: false}}, (err, data) => {
        if (err) res.send(err);
        res.send("success");
        client.close();
      });
    });
  })
    
    .delete((req, res) => {
    
    MongoClient.connect(process.env.DB, (err, client) => {
      client.db('test').collection('threads').findOne({_id: ObjectId(req.body.thread_id)}, (err, data) => {
        if (data.delete_password !== req.body.delete_password){
          res.send("incorrect password");
        }
        else{
          client.db('test').collection('threads').deleteOne({_id: ObjectId(req.body.thread_id)}, (err, result) => {
            res.send('success');
          });
        }
        client.close();
      });
    });
  });
    
  app.route('/api/replies/:board')
    .get((req, res) => {
    MongoClient.connect(process.env.DB, (err, client) => {
      client.db('test').collection('threads').findOne({_id: ObjectId(req.query.thread_id)}, {reported: 0, delete_password: 0, 'replies.reported': 0, 'replies.delete_password': 0}, (err, data) => {
        if (err) res.send(err);
        res.send(data);
        client.close();
      });
    });
  })
    
    .post((req, res) => {
    const date = new Date();
    const reply = {_id: new ObjectId(), text: req.body.text, delete_password: req.body.delete_password, created_on: date, reported: false}
    
    MongoClient.connect(process.env.DB, (err, client) => {
      client.db('test').collection('threads').updateOne({_id: ObjectId(req.body.thread_id)}, {$set: {bumped_on: date}, $push: {replies: reply}, $inc: {replycount: 1}}, (err, data) => { 
        if (err) res.send(err);
        else res.redirect(`/b/${req.body.board}/${req.body.thread_id}`);
        client.close();
      });
      
    });
      
  })
    
    .put((req, res) => {
    MongoClient.connect(process.env.DB, (err, client) => {
      client.db('test').collection('threads').updateOne({_id: ObjectId(req.body.thread_id)}, {$set: {"replies.$[elem].reported": true}}, {arrayFilters: [{"elem._id": ObjectId(req.body.reply_id)}]}, (err, data) => {
        if (err) res.send(err);
        else res.send("success");
        client.close();
      });
    });
  })
    
    .delete((req, res) => {
    MongoClient.connect(process.env.DB, (err, client) => {
      client.db('test').collection('threads').findOne({_id: ObjectId(req.body.thread_id)}, {replies: {$elemMatch: {_id: ObjectId(req.body.reply_id)}}}, (err, data) => {
        if (req.body.delete_password === data.replies[0].delete_password){
          client.db('test').collection('threads').updateOne({_id: ObjectId(req.body.thread_id)}, {$set: {'replies.$[elem].text': "[deleted]"}}, {arrayFilters: [{"elem._id": ObjectId(req.body.reply_id)}]}, (err, data) => {
            res.send("success");
          });
        }
        else{
          res.send("incorrect password")
        }
        client.close();
      });
    });
  });

};
