var bcrypt = require('bcrypt')

module.exports = function(sequelize, DataTypes) {
    var History = sequelize.define("history", {
        id_imdb: {
            type         : DataTypes.INTEGER
        },
        id_user: {
            type         : DataTypes.INTEGER
        }
    });

    // History.createComment = function() {

        // /!\ NE PAS UTILISER ICI MAIS DANS UNE ROUTE COMME `register.js`


        // models.sequelize.sync()
        //     .then(function() {
        //         return models.movie.create({
        //                 id_imdb: movie.id,
        //                 id_user:  user.id
        //             });
        //     })
        //     .catch(function(err) {
        //         if (err && err.message)
        //             console.log(err.message)
        //         else
        //             console.log(err)
        //     })

    // };


    return (History);
};