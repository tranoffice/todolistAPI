import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

colTodolist = new Mongo.Collection('tasks');
/**
 * MongoDB :
 * Collection = tasks
 * Document = 
 * > _id : task id
 * > task: task description
 * > status: Todo / In progress / Completed 
 */

if ( Meteor.isServer ) {
  Meteor.startup(() => {
  });

  var Api = new Restivus({
    apiPath: '',
    useDefaultAuth: false,
    prettyJson: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
      'access-control-allow-origin':'*',
    }
  });
  Api.addCollection(colTodolist);
  Api.addRoute('todotasks', {authRequired: false}, {
    /**
     * GET /todotasks - Select all tasks
     * ===================================
     */
    get: function () {
      console.log('API : todotasks >> GET');
      var tasks = [];
      var tasksList = colTodolist.find().fetch();
      tasksList.forEach(element => {
        tasks.push({id: element._id, task: element.task, status: element.status})
      });
      return({
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(tasks),
      });
    },
    /**
     * POST /todotasks - Create new task
     * ===================================
     */
    post: function () {
      console.log('API : todotasks >> POST');
      console.log(this.bodyParams);
      if ( this.bodyParams.id === undefined ||
        this.bodyParams.task === undefined ||
        this.bodyParams.status === undefined
        ) {
        res = {
          "code": 400,
          "message": 'Invalid data'
        };
      } else {
        var task = colTodolist.find({_id: this.bodyParams.id}).fetch();
        if ( task.length > 0 ) {
          res = {
            "code": 400,
            "message": 'Task already exist - cannot insert'
          };
        } else {
          var retcode = colTodolist.insert({
            _id: this.bodyParams.id,
            task: this.bodyParams.task,
            status: this.bodyParams.status
          })
          res = {
            "code": 200,
            "message": 'Task added'
          };
        }
      }
      return({
        statusCode: res.code,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: res,
      });
    }
  });  

  var ApiTask = new Restivus({
    apiPath: 'todotask',
    useDefaultAuth: false,
    prettyJson: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
      'access-control-allow-origin':'*',
    }
  });
  ApiTask.addCollection(colTodolist);
  ApiTask.addRoute(':id', {authRequired: false}, {
    /**
     * GET /todotask - BY ID
     * ===================================
     */
    get: function () {
      console.log('API : todotask >> GET ID=' + this.urlParams.id);
      var res;
      var httpstatus;
      if ( this.urlParams.id === undefined ) {
        res = {
          "code": 400,
          "message": 'Bad request - id undefined'
        };
        httpstatus = res.code;
      } else {
        var task = colTodolist.find({_id: this.urlParams.id}).fetch();
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
      }
    
      return({
        statusCode: httpstatus,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: res,
      });
    },
    /**
     * POST /todotask/:id - UPDATE task by id
     * ======================================
     */
    post: function() {
      console.log('API : todotask >> POST ID=' + this.urlParams.id);
      console.log(this.bodyParams);
      var res;
      if ( this.urlParams.id === undefined ) {
        res = {
          "code": 400,
          "message": 'Bad request - id undefined'
        };
      } else {
        var task = colTodolist.find({_id: this.urlParams.id}).fetch();
        if ( task.length > 0 ) {
          var retcode = colTodolist.update(
            { _id: this.urlParams.id },
            { $set: {
                task: this.bodyParams.task,
                status: this.bodyParams.status
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
        return({
          statusCode: res.code,
          body: res,
        });
      }
    },
    /**
     * DELETE /todotask/:id - Delete task by id
     * ========================================
     */
    delete: function() {
      console.log('API : todotask >> DELETE ID=' + this.urlParams.id);
      var res;
      if ( this.urlParams.id === undefined ) {
        res = {
          "code": 400,
          "message": 'Bad request - id undefined'
        };
      } else {
        var task = colTodolist.find({_id: this.urlParams.id}).fetch();
        if ( task.length > 0 ) {
          var retcode = colTodolist.remove({ _id: this.urlParams.id });
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
        return({
          statusCode: res.code,
          body: res,
        });
      }
    }
  });
}
