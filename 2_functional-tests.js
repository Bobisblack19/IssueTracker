const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let newId;

suite('Functional Tests', function() {
  
  //post tests
  //1
   test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .post('/api/issues/projects')
        .set("content-type", "application/json")
        .send({issue_title:"Issue",
              issue_text: "Functional Test",
              created_by:"FCC",
              assigned_to: "joe",
              status_text:"Not Done"})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          newId = res.body._id;
          assert.equal(res.body.issue_title, "Issue");
          assert.equal(res.body.issue_text, "Functional Test");
          assert.equal(res.body.created_by, "FCC");
          assert.equal(res.body.assigned_to, "joe");
          assert.equal(res.body.status_text, "Not Done")
          done();
        });
    });

    //2
     test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .post('/api/issues/projects')
        .set("content-type", "application/json")
        .send({issue_title:"Issue",
              issue_text: "Functional Test",
              created_by:"FCC",
              assigned_to: "",
              status_text:""})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Issue");
          assert.equal(res.body.issue_text, "Functional Test");
          assert.equal(res.body.created_by, "FCC");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "")
          done();
        });
    });

    //3
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .post('/api/issues/projects')
        .set("content-type", "application/json")
        .send({issue_title:"",
              issue_text: "",
              created_by:"FCC",
              assigned_to: "",
              status_text:""})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
    
    //get tests

    //4
     test('View issues on a project: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 3)
          done();
        });
    });

    //5
    test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({ _id:"6196735c4d496e00ea231f43" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body[0], {
            _id:"6196735c4d496e00ea231f43",issue_title:"still no connectivity",
            issue_text:"come on, Mang",created_on:"2021-11-18T15:38:04.882Z",updated_on:"2021-11-23T21:25:48.471Z",
            created_by:"that dude",assigned_to:"joe",
            status_text:"still not fixed"
          })
          done();
        });
    });

    test('View issues on a project: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({ _id:"6196735c4d496e00ea231f43",
        assigned_to:"joe" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body[0], {
            _id:"6196735c4d496e00ea231f43",issue_title:"still no connectivity",
            issue_text:"come on, Mang",created_on:"2021-11-18T15:38:04.882Z",updated_on:"2021-11-23T21:25:48.471Z",
            created_by:"that dude",assigned_to:"joe",
            status_text:"still not fixed"
          })
          done();
        });
    });

    //put tests

    test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({_id:"6197d8b42dc11402ae6c0ab5", issue_title:"still no connectivity"})
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully updated")
          assert.equal(res.body._id, "6197d8b42dc11402ae6c0ab5")
          done();
        });
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({_id:"6197d8b42dc11402ae6c0ab5", issue_title:"still no connectivity",issue_text:"come on, Mang"})
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully updated")
          assert.equal(res.body._id, "6197d8b42dc11402ae6c0ab5")
          done();
        });
    });

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .end(function (err, res) {
          assert.equal(res.body.error, "missing _id")
          done();
        });
    });

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({_id:"6197d8b42dc11402ae6c0ab5"})
        .end(function (err, res) {
          assert.equal(res.body.error, "no update field(s) sent")
          done();
        });
    });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({_id:"6196735c4d496e00ea671098",
        issue_text:"bruh"})
        .end(function (err, res) {
          assert.equal(res.body.error, "could not update")
          done();
        });
    });

    //delete tests

    test('Delete an issue: DELETE request to /api/issues/{project', function (done) {
      chai
        .request(server)
        .delete('/api/issues/projects')
        .send({ _id:newId })
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully deleted")
          done();
        });
    });

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .delete('/api/issues/projects')
        .send({ _id:"6196735c4d496e00ea671098" })
        .end(function (err, res) {
          assert.equal(res.body.error, "could not delete")
          done();
        });
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .delete('/api/issues/projects')
        .end(function (err, res) {
          assert.equal(res.body.error, "missing _id")
          done();
        });
    });
});

