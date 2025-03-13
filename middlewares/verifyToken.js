const jwt = require('jsonwebtoken');

//Verify Token
function verifyToken(req, res, next)
{
    const authToken = req.headers.authorization;
    if(authToken)
    {
        const token = authToken.split(" ")[1];
        try {
            const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedPayload;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid token, access denied"});
        }
    }
    else
    {
        return res.status(401).json({ message: "No token provided, access denied"});
    }
}


function verifyTokenAdmin(req, res, next)
{
    verifyToken(req, res, () =>
    {
        if(req.user.isAdmin)
        {
            next();
        }
        else{
            return res.status(403).json({ message: "Not allowed, Only admin" })
        }
    })
};


function verifyTokenOnlyUser(req, res, next)
{
    verifyToken(req, res, () =>
    {
        if(req.user.id === req.params.id)
        {
            next();
        }
        else{
            return res.status(403).json({ message: "Not allowed, Only User" })
        }
    })
}


//Verify Token and Authorization
function verifyTokenAndAuthorization(req, res, next)
{
    verifyToken(req, res, () =>
    {
        if(req.user.id === req.params.id || req.user.isAdmin)
        {
            next();
        }
        else{
            return res.status(403).json({ message: "Not allowed, Only User or Admin" })
        }
    })
}



module.exports = 
{
    verifyToken,
    verifyTokenAdmin,
    verifyTokenOnlyUser,
    verifyTokenAndAuthorization
}