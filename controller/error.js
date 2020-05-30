exports.get404 = (req,res,next)=>{
    res.status(404).render('404', {pagetitle: 'Page Not Found', path:'/404',
    isAuthenticated: req.isLoggedIn})
};

exports.get505 = (req,res,next)=>{
    res.status(404).render('505', {pagetitle: 'Error!', path:'/505',
    isAuthenticated: req.isLoggedIn})
};