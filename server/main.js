import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';


if ( Meteor.isServer ) {
  Meteor.startup(() => {
    colTodolist = new Mongo.Collection('tasks');
    /**
     * MongoDB :
     * Collection = tasks
     * Document = 
     * > _id : task id
     * > task: task description
     * > status: Todo / In progress / Completed 
     */
  });

  Router.route('/todotasks', { where: 'server' })
    /**
     * GET /todotasks - Select all tasks
     * ===================================
     */
    .get(function() {
      var tasks = [];
      var tasksList = colTodolist.find().fetch();
      tasksList.forEach(element => {
        tasks.push({id: element._id, task: element.task, status: element.status})
      });
      this.response.setHeader('Content-Type','application/json');
      this.response.end(JSON.stringify(tasks));
    })
    /**
     * POST /todotasks - Create new task
     * ===================================
     */
    .post(function() {
      var res;
      if ( this.request.body.id === undefined ||
           this.request.body.task === undefined ||
           this.request.body.status === undefined
          ) {
        res = {
          "code": 400,
          "message": 'Invalid data'
        };
      } else {
        var task = colTodolist.find({_id: this.request.body.id}).fetch();
        if ( task.length > 0 ) {
          res = {
            "code": 400,
            "message": 'Task already exist - cannot insert'
          };
        } else {
          var retcode = colTodolist.insert({
            _id: this.request.body.id,
            task: this.request.body.task,
            status: this.request.body.status
          })
          res = {
            "code": 200,
            "message": 'Task added'
          };
        }
      }
      this.response.setHeader('Content-Type','application/json');
      this.response.writeHead(res.code);
      this.response.end(JSON.stringify(res));
    });

    Router.route('/todotask/:id', { where: 'server' })
    /**
     * GET /todotask/:id - Select a task by id
     * ===================================
     */
    .get(function() {
      var res;
      var httpstatus;
      if ( this.params.id === undefined ) {
        res = {
          "code": 400,
          "message": 'Bad request - id undefined'
        };
        httpstatus = res.code;
      } else {
        var task = colTodolist.find({_id: this.params.id}).fetch();
        if ( task.length > 0 ) {
          res = {"id": task[0]._id, "task": task[0].task, "status": task[0].status};
          httpstatus = 200;
        } else {
          res = {
            "code": 400,
            "message": 'Not found'
          };
          httpstatus = res.code;
        }
        this.response.setHeader('Content-Type','application/json');
        this.response.writeHead(httpstatus);
        this.response.end(JSON.stringify(res));
      }
    })
    /**
     * PUT /todotask/:id - UPDATE task by id
     * =====================================
     */
    .put(function() {
      var res;
      if ( this.params.id === undefined ) {
        res = {
          "code": 400,
          "message": 'Bad request - id undefined'
        };
      } else {
        var task = colTodolist.find({_id: this.params.id}).fetch();
        if ( task.length > 0 ) {
          var retcode = colTodolist.update(
            { _id: this.params.id },
            { $set: {
                task: this.request.body.task,
                status: this.request.body.status
            }}
          );
          if ( retcode === 1 ) {
            res = {
              "code": 200,
              "message": 'Task updated'
            };
          } else {
            res = {
              "code": 400,
              "message": 'Unexpected error'
            };
          }
        } else {
          res = {
            "code": 400,
            "message": 'Not found'
          };
        }
        this.response.setHeader('Content-Type','application/json');
        this.response.writeHead(res.code);
        this.response.end(JSON.stringify(res));
      }
    })
    /**
     * DELETE /todotask/:id - Delete task by id
     * ========================================
     */
    .delete(function() {
      var res;
      if ( this.params.id === undefined ) {
        res = {
          "code": 400,
          "message": 'Bad request - id undefined'
        };
      } else {
        var task = colTodolist.find({_id: this.params.id}).fetch();
        if ( task.length > 0 ) {
          var retcode = colTodolist.remove({ _id: this.params.id });
          if ( retcode === 1 ) {
            res = {
              "code": 200,
              "message": 'Task deleted'
            };
          } else {
            res = {
              "code": 400,
              "message": 'Unexpected error'
            };
          }
        } else {
          res = {
            "code": 400,
            "message": 'Task not found'
          };
        }
        this.response.setHeader('Content-Type','application/json');
        this.response.writeHead(res.code);
        this.response.end(JSON.stringify(res));
      }
    });
}
