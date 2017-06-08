var bcrypt = require('bcrypt')

module.exports = function(sequelize, DataTypes) {
    var Comment = sequelize.define("comment", {
        id_imdb: {
            type     : DataTypes.INTEGER
        },
        id_user: {
            type     : DataTypes.INTEGER
        },
        content: {
            type     : DataTypes.STRING,
            validate : {
                len  : [1, 255]
            }
        }
    });

    // Comment.createComment = function() {

        // /!\ NE PAS UTILISER ICI MAIS DANS UNE ROUTE COMME `register.js`


        // models.sequelize.sync()
        //     .then(function() {
        //         return models.comment.create({
        //                 id_imdb: movie.id,
        //                 id_user:  user.id,
        //                 content: commentaire
        //             });
        //     })
        //     .catch(function(err) {
        //         if (err && err.message)
        //             console.log(err.message)
        //         else
        //             console.log(err)
        //     })
        
    // };


    return (Comment);
};