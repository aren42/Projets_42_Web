var express = require('express');
var passport = require('passport');
var router = express.Router();

// Local authentification

router.post('/local', 
    require('../auth/local').passport
);

// Facebook authentification

router.get('/facebook',
    passport.authenticate('facebook'));

router.get('/facebook/callback',
    passport.authenticate('facebook', { 
        successRedirect : '/',
        failureRedirect : '/?err=facebook'
    })
);

// Intra42 authentification

router.get('/42',
    passport.authenticate('42'));
 
router.get('/42/callback',
    passport.authenticate('42', { 
        successRedirect : '/',
        failureRedirect : '/?err=42'
    })
);


// Twitter authentification

router.get('/twitter',
    passport.authenticate('twitter'));

router.get('/twitter/callback', 
    passport.authenticate('twitter', { 
        successRedirect : '/',
        failureRedirect : '/?err=twitter'
    })
);

// Instagram authentification

router.get('/instagram',
    passport.authenticate('instagram'));

router.get('/intagram/callback', 
    passport.authenticate('instagram', { 
        successRedirect : '/',
        failureRedirect : '/?err=insta'
    })
);

// Github authentification

router.get('/github',
    passport.authenticate('github'));

router.get('/github/callback', 
    passport.authenticate('github', { 
        successRedirect : '/',
        failureRedirect : '/?err=github'
    })
);

// Linkedin authentification

router.get('/linkedin',
    passport.authenticate('linkedin'));

router.get('/linkedin/callback', 
    passport.authenticate('linkedin', { 
        successRedirect : '/',
        failureRedirect : '/?err=linkedin'
    })
);

// Logout

router.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/');
});

module.exports = router;
