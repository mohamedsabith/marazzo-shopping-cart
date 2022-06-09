const jwt = require("jsonwebtoken");

const verifyUser= (req, res, next) => {
    try {
        
        const token = req.cookies.token;
    
        if (!token){
            res.redirect('/login')
        }else{
        const decoded = jwt.verify(token,process.env.JWT_TOKEN);
        req.user = decoded;
        next();
        }
    } catch (error) {
        res.clearCookie("token");
        res.status(400).send("Invalid token");
    }
};

const verifyToken= (req, res, next) => {
    try {
        
        const token = req.cookies.token;
         
        if (!token) return res.status(403).send("LINK EXPIRED.");

        const decoded = jwt.verify(token,process.env.RESET_PASSWORD_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send("Invalid token");
    }
};

const verifySession = (req,res,next) => {
   if(req.session.loggedIn){
       res.redirect('/')
   }else{
      next()
   }
}

module.exports={verifyUser,verifyToken,verifySession};