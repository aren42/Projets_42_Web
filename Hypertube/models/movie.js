module.exports = function(sequelize, DataTypes) {
    var Movie = sequelize.define("movie", {
        id_imdb: {
            type         : DataTypes.INTEGER,
            unique       : true
        },
        is_indexed: {
            type         : DataTypes.BOOLEAN,
            defaultValue : 0
        },
        is_downloaded: {
            type         : DataTypes.BOOLEAN,
            defaultValue : 0
        }
    });

    return (Movie);
};


    // Create a movie

    // models.sequelize.sync()
    //   .then(function() {
    //       return models.movie.create({
    //               id_imdb: movie.id
    //           });
    //   })
    //   .catch(function(err) {
    //       if (err && err.message)
    //           console.log(err.message);
    //       else
    //           console.log(err);
    //   })


    // Update a movie

    // models.sequelize.sync()
    //   .then(function() {
    //       return models.movie.update({
    //                 is_indexed : 1,
    //                 is_downloaded: 1
    //              },
    //              { where: { id_imdb: movie.id } })
    //   })
    //   .catch(function(err) {
    //       if (err && err.message)
    //           console.log(err.message);
    //       else
    //           console.log(err);
    //   })