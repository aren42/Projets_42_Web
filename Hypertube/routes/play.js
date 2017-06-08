var express   = require('express');
var router    = express.Router();
var models    = require('../models');
var imdb      = require('imdb-api');
var _         = require('underscore');
var ts = require('torrent-stream');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var waitUntil = require('wait-until');

var get_magnet = function(torrents) {
    if (torrents) {
        var torrent_3D_magnet = null, 
            torrent_720_magnet = null,
            torrent_1080_magnet = null;

        if (torrents[0].quality == "3D") {
            torrent_3D_magnet = 'magnet:?xt=urn:btih:' + torrents[0].hash;

            if (torrents[1]) {
                torrent_720_magnet = 'magnet:?xt=urn:btih:' + torrents[1].hash;
            }

            if (torrents[2]) {
                torrent_1080_magnet = 'magnet:?xt=urn:btih:' + torrents[2].hash;
            }
        }

        if (torrents[0].quality == "720p") {
            torrent_720_magnet = 'magnet:?xt=urn:btih:' + torrents[0].hash;

            if (torrents[1]) {
                torrent_1080_magnet = 'magnet:?xt=urn:btih:' + torrents[1].hash;
            }
        }

        if (torrents[0].quality == "1080p") {
            torrent_1080_magnet = 'magnet:?xt=urn:btih:' + torrents[0].hash;
        }
        return ({magnet_3D: torrent_3D_magnet, magnet_720: torrent_720_magnet, magnet_1080: torrent_1080_magnet});
    }
};

var dld = function(magnet, uid_imdb, res) {
    var engine = ts(magnet, { path: './public/film/' + uid_imdb });
    var models = require('../models')
    

    models.sequelize.sync()
        .then(function() {
            return models.movie.update({
                    is_indexed : 1
                    },
                    { where: { id_imdb: uid_imdb } })
        })
        .catch(function(err) {
            if (err && err.message)
                console.log(err.message);
            else
                console.log(err);
        })
    engine.on('ready', function() {
        var file = engine.files.filter(function(data) {
            var format = data.name.split('.').slice(-1)[0];
            if (format == 'mkv' || format == 'avi' || format == 'mp4')
                return true;
        }).sort(function (a, b) { return b.length - a.length; })[0];
        if (file && file != 'undefined') {
            var format = file.name.split('.').slice(-1)[0];
            var stream = file.createReadStream();
            ffmpeg()
                .input(stream)
                .outputOptions(
                    '-c:v', 'libx264',
                    '-c:a', 'aac',
                    '-map', 0,
                    '-f', 'segment',
                    '-segment_list_flags', '-live',
                    '-segment_time', 30,
                    '-segment_list', './public/film/' + uid_imdb + '/index.m3u8',
                    '-segment_list_type', 'm3u8',
                    '-threads', 2,
                    '-r', 18)
                .output('./public/film/' + uid_imdb + '/seg%03d.ts')
                .on('error', function(err, stdout, stderr) {
                    console.log('Cannot process video: ' + err.message);
                }).on('end', function() {
                    console.log('Copy finish');
                }).run();
            waitUntil()
                .interval(10000)
                .times(100)
                .condition(function() {
                    return (fs.existsSync('./public/film/' + uid_imdb + '/index.m3u8') ? true : false);
                }).done(function(result) {
                    if (result == true) {
                        models.sequelize.sync()
                            .then(function() {
                                return models.movie.update({
                                        is_downloaded : 1
                                        },
                                        { where: { id_imdb: uid_imdb } })
                            })
                            .catch(function(err) {
                                if (err && err.message)
                                    console.log(err.message);
                                else
                                    console.log(err);
                            })
                        res.json({ 'status': 1});
                    }
                });
        }
        engine.on('download', function(pieceIndex, buffer) {
            console.log('Piece downloaded for', uid_imdb, 'with index:', pieceIndex);
        });
        engine.on('upload', function(pieceIndex, offset, length) {
            console.log('Piece uploaded for', uid_imdb, 'with index:', pieceIndex);
        });
    });
}

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
            console.log(json);
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

/* GET home page. */
router.get('/:id', function(req, res, next) {
    if (req.session.passport && req.session.passport.user) {
         var connected = true
         console.log(req)

         get_movies_details(req.params, function(movie) {

            var models = require('../models')

            models.movie.findOne({where : {id_imdb: movie.id}})
                .then(function(movie_){
                    console.log(movie_)
                    if (!movie_) {
                        models.sequelize.sync()
                            .then(function() {
                                return models.movie.create({
                                        id_imdb: movie.id
                                    })
                                    .then(function(){
                                            // res.send(movie)
                                            console.log('movie1')
                                            var magnet = get_magnet(movie.torrents);
                                            dld(magnet.magnet_720, movie.id, res);
                                            console.log(magnet);
                                            // res.render('movie', {
                                            // title: 'Hypertube | Page movie',
                                            // user: req.session.passport.user,
                                            // connected: connected,
                                            // movie: movie
                                            // })
                                        })
                                    })
                            .catch(function(err) {
                                if (err && err.message)
                                    console.log(err.message);
                                else
                                    console.log(err);
                            })
                    }
                    else {
                         // res.send(movie)
                        console.log('movie')
                        var magnet = get_magnet(movie.torrents);
                        dld(magnet.magnet_720, movie.id, res);
                        console.log(magnet);
                        // res.render('movie', {
                        // title: 'Hypertube | Page movie',
                        // user: req.session.passport.user,
                        // connected: connected,
                        // movie: movie
                        // })
                    }
                })
                .catch(function(err){
                    if (err && err.message)
                        console.log(err.message);
                    else
                        console.log(err);
                })
        })
	} else {
		res.redirect('/')
	}
});

module.exports = router;