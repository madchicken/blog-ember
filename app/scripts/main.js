App = Ember.Application.create();

App.Router.map(function() {
    this.resource('post', {path: '/:id'});
});

App.Post = Ember.Object.extend({
    ellipsis: function() {
        return this.get('text').substr(0, 20) + "...";
    }.property('text'),

    addComment: function(comment) {
        console.log('Creating comment ', comment);
        return $.post("/api/blog/"+ this.get('id') + "/comment", comment, function(data) {}, 'json');
    }
});

App.Comment = Ember.Object.extend({
    date: function() {
        return moment(new Date(this.get('dateCreated'))).format('MMMM Do YYYY, h:mm:ss');;
    }.property('dateCreated')
});

App.IndexRoute = Ember.Route.extend({
    model: function() {
        return $.getJSON("/api/blog").then(function(data) {
            var posts = data.posts;
            return posts.map(function(post) {
                if(post.comments) {
                    post.comments = post.comments.map(function(comment) {
                        return App.Comment.create(comment);
                    });
                }
                return App.Post.create(post);
            });
        });
    }
});


App.PostRoute = Ember.Route.extend({
    model: function(params) {
        return $.getJSON("/api/blog/" + params.id).then(function(data) {
            var post = data.post;
            if(post.comments) {
                post.comments = post.comments.map(function(comment) {
                    return App.Comment.create(comment);
                });
            }
            return App.Post.create(post);
        });
    },

    actions: {
        addComment: function() {
            var controller = this.controller;
            var post = this.controller.get('model');
            post.addComment({text: this.controller.get('commentText'), author: this.controller.get('commentAuthor')}).then(function(data) {
                post.get('comments').pushObject(App.Comment.create(data.comment));
                controller.set('commentAuthor', null);
                controller.set('commentText', null);
            });
        }
    }

});