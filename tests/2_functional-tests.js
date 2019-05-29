/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    let id;
    
    suite('POST', function() {
      test('POST Thread', function(done){
        chai.request(server)
          .post('/api/threads/general')
          .send({text: 'jhgjhgjhg', delete_password: 'jhfjhgj'})
          .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('GET Thread', function(done){
        chai.request(server)
          .get('/api/threads/general')
          .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isAtMost(res.body.length, 10);
          assert.isAtMost(res.body[0].replies.length, 3);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'text');
          id = res.body[0]._id;
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('PUT Thread', function(done){
        chai.request(server)
          .put('/api/threads/general')
          .send({thread_id: id})
          .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('DELETE Thread Incorrect Password', function(done){
        chai.request(server)
          .delete('/api/threads/general')
          .send({thread_id: id, delete_password: 'asdfasda'})
          .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('DELETE Thread Correct Password', function(done){
        chai.request(server)
          .delete('/api/threads/general')
          .send({thread_id: id, delete_password: 'jhfjhgj'})
          .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    let id;
    let reply_id;
    
    chai.request(server)
      .post('/api/threads/general')
      .send({text: 'jhgjhgjhg', delete_password: 'jhfjhgj'})
      .then((res) => {
      assert.equal(res.status, 200);
    });
    chai.request(server)
      .get('/api/threads/general')
      .then((res) => {
      id = res.body[0]._id;
    });
    
    suite('POST', function() {
      test('POST Reply', function(done){
        chai.request(server)
          .post('/api/replies/general')
          .send({thread_id: id, text: 'jhgjhgjhg', delete_password: 'jhfjhgj'})
          .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('GET Replies', function(done){
        chai.request(server)
          .get('/api/replies/general?thread_id=' + id)
          .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body.replies[0], '_id');
          assert.property(res.body.replies[0], 'text');
          assert.property(res.body.replies[0], 'created_on');
          assert.equal(res.body.replies[0].created_on, res.body.bumped_on);
          reply_id = res.body.replies[0]._id;
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('PUT Reply', function(done){
        chai.request(server)
          .put('/api/replies/general')
          .send({thread_id: id, reply_id: reply_id})
          .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('DELETE Thread Incorrect Password', function(done){
        chai.request(server)
          .delete('/api/threads/general')
          .send({thread_id: id, reply_id: reply_id, delete_password: 'asdfasda'})
          .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('DELETE Thread Correct Password', function(done){
        chai.request(server)
          .delete('/api/threads/general')
          .send({thread_id: id, reply_id: reply_id, delete_password: 'jhfjhgj'})
          .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
    chai.request(server)
      .delete('/api/threads/general')
      .send({thread_id: id, delete_password: 'jhfjhgj'})
    
  });

});
