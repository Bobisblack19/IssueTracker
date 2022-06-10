'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId

const IssueSchema = new Schema({
    issue_title: {type:String, required:true},
    issue_text: {type:String, required:true},
    created_on: Date,
    updated_on: Date,
    created_by: {type:String, required:true},
    assigned_to: {type:String, required:false},
    open: Boolean,
    status_text: {type:String, required:false}
})

const Issue = mongoose.model("Issue", IssueSchema)

const ProjectSchema = new Schema ({
  name: {type:String, required:true},
  issues: [IssueSchema]
})

const Project = mongoose.model("Project", ProjectSchema)

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let projectName = req.params.project;

      const { _id,
              open,
              issue_title,
              issue_text,
              created_by,
              assigned_to,
              status_text} = req.query;

      Project.aggregate([
        {$match: {name: projectName}},
        {$unwind: "$issues"},
        _id != undefined
        ? {$match: {"issues._id":ObjectId(_id)}}
        : {$match: {}},
        open != undefined
        ? {$match: {"issues.open":open}}
        : {$match: {}},
        issue_title != undefined
        ? {$match: {"issues.issue_title":issue_title}}
        : {$match: {}},
        issue_text != undefined
        ? {$match: {"issues.issue_text":issue_text}}
        : {$match: {}},
        created_by != undefined
        ? {$match: {"issues.created_by": created_by}}
        : {$match: {}},
        assigned_to != undefined
        ? {$match: {"issues.assigned_to":assigned_to}}
        : {$match: {}},
        status_text != undefined
        ? {$match: {"issues.status_text":status_text}}
        : {$match: {}}
      ]).exec((err, data) => {
          if (!data) {
            res.json({})
           } else {
             let mapData = data.map((item) => item.issues);
             res.json(mapData)
           }
        })
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
      const { issue_title,
              issue_text,
              created_by,
              assigned_to,
              status_text } = req.body;
    
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" })
        return;
      }
      
      const newIssue = new Issue({
         issue_title: issue_title,
         issue_text: issue_text,
         created_on: new Date(),
         updated_on: new Date(),
         created_by: created_by,
         assigned_to: assigned_to || "",
         open: true,
         status_text: status_text || ""
      })

      Project.findOne({name: project}, (err, projectdata) => {
        if (!projectdata) {
          const newProject = new Project({
            name:project
          })
          newProject.issues.push(newIssue);
          newProject.save((err,data) => {
            if (err || !data) {
              res.send("there was an error saving issue")
            } else {
              res.json(newIssue)
            }
          })
        } else {
          projectdata.issues.push(newIssue);
          projectdata.save((err, data) => {
              if (err || !data) {
              res.send("there was an error saving issue")
            } else {
              res.json(newIssue)
            }
          })
        }
      
      })

    })
    
    .put(function (req, res){
      let project = req.params.project;

      const { _id,
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text, 
            open} = req.body

      if (!_id) {
        res.json({ error: 'missing _id' });
        return;
      }

      if (!issue_title &&
          !issue_text &&
          !created_by &&
          !assigned_to &&
          !status_text &&
          !open) {
          res.json({error: 'no update field(s) sent', '_id': _id });
          return;
      }

      Project.findOne({name: project}, (err, projectdata) => {
        if (err||!projectdata) {
          res.json({ error: 'could not update', '_id': _id })
        } else {
          const issuesData = projectdata.issues.id(_id);
          if (!issuesData) {
            res.json({ error: 'could not update', '_id': _id })
            return;
          }
          issuesData.issue_title = issue_title || issuesData.issue_title;
          issuesData.issue_text = issue_text || issuesData.issue_text;
          issuesData.created_by = created_by || issuesData.created_by;
          issuesData.assigned_to = assigned_to || issuesData.assigned_to;
          issuesData.status_text = status_text || issuesData.status_text;
          issuesData.updated_on = new Date();
          issuesData.open = open;
          projectdata.save((err, data) => {
            if (err || !data) {
              res.json({ error: 'could not update', '_id': _id })
            } else {
              res.json({  result: 'successfully updated', '_id': _id })
            }
          })
        }
      })
    })
    
    .delete(function (req, res){
      let project = req.params.project;

      const{ _id } = req.body
      
      if (!_id) {
        res.json({ error: 'missing _id' });
        return;
        }

      Project.findOne({name: project}, (err, projectdata) => {
        if (!projectdata || err) {
          res.send({ error: 'could not delete', '_id': _id })
        } else {
          const issuesData = projectdata.issues.id(_id);
          if (!issuesData) {
            res.send({ error: 'could not delete', '_id': _id });
            return;
          } 
          issuesData.remove();

          projectdata.save((err, data) => {
            if (err || !data) {
              res.json({ error: 'could not delete', '_id': issuesData._id })
            } else {
                res.json({ result: 'successfully deleted', '_id': issuesData._id })
              }
            })
          };
        })

      
    });
    
};
