var express   = require('express');
var router    = express.Router();
var models    = require('../models');
var imdb      = require('imdb-api');
var _         = require('underscore');

function get_imdb_content(movies, cb) {
    imdb.getReq({ id: movies.imdb_code }).then((things) => {
      movies.imdb = things
    }).then((things) => {
        cb(movies)
    }).catch(err => {
        cb(movies)
    })
}

function get_movies_details(params, cb) {
  var request = require("request");
  request({
      uri: 'https://yts.ag/api/v2/movie_details.json',
      json: true,
      qs: {
        movie_id: params.id,
        with_cast: true,
        with_images: true
      }
    }, function (err, resp, json) {
        if (!err) {
            var movies = json.data.movie
            get_imdb_content(movies, function(movies) {
              if (cb) {
                cb(movies)
              }
            })
        }
        else { 
            cb(null)
        }
    })
}

function get_language_sub(imdb_code, pref_lang, cb) {
  const yifysubtitles = require('yifysubtitles');
  var accepted_lang = ["sq", "ar", "bn", "pb", "bg", "zh", "hr", "cs", "da", "nl", "en", "et", "fa", "fi", "fr", "de", "el", "he", "hu", "id", "it", "ja", "ko", "lt", "mk", "ms", "no", "pl", "pt", "ro", "ru", "sr", "sl", "es", "sv", "th", "tr", "ur", "uk", "vi"]
  if (accepted_lang.includes(pref_lang)) {
    var lang = pref_lang
  }
  else {
    var lang = 'fr'
  }
  yifysubtitles(imdb_code,  {path: './public/subtitles/', langs: ['en', lang]})
    .then(res => {
        var result = _.each(res, function(value) {
          value.path = value.path.replace("public", "")
        })
        if (cb) {
          cb(result)
        }
    })
    .catch(err => {if (cb){cb(null)} });
}

function set_movie_view(id_movie, id_user, cb) {
  var models = require('../models')

  models.history.findOne({where : { id_imdb: id_movie, id_user: id_user }})
    .then(function(history) {
      if (history == null) {
        models.sequelize.sync()
          .then(function(){
            cb(null, models.history.create({
              id_imdb: id_movie,
              id_user: id_user
            }))
          })
          .catch(function(err){
            cb(err, null);
          })
      }
      else {
        cb(null)
      }
    })
}

/* GET home page. */
router.get('/:id', function(req, res, next) {
    if (req.session.passport && req.session.passport.user) {
        var connected = true
        set_movie_view(req.params.id, req.session.passport.user.id, function(err, toto) {
          get_movies_details(req.params, function(movie) {
            get_language_sub(movie.imdb_code, req.session.passport.user.lang, function(sub) {
              var models = require('../models');

              models.movie.findOne({where : {id_imdb : movie.id}})
                .then(function(movie_) {
                  if (!movie_) {
                    res.render('movie', {
                      title: 'Hypertube | Page movie',
                      user: req.session.passport.user,
                      connected: connected,
                      movie: movie,
                      sub_lang: sub
                    })
                  }
                  else {
                    res.render('movie', {
                      title: 'Hypertube | Page movie',
                      user: req.session.passport.user,
                      connected: connected,
                      movie: movie,
                      movie_: movie_,
                      sub_lang: sub
                    })
                  }

                })
                .catch(function(err) {
                  if (err && err.message)
                    console.log(err.message);
                  else
                    console.log(err);
                })
              res.render('movie', {
                title: 'Hypertube | Page movie',
                user: req.session.passport.user,
                connected: connected,
                movie: movie,
                movie_:movie_,
                sub_lang: sub
              })
            })
          })
        })
	} else {
		res.redirect('/')
	}
});

module.exports = router;
