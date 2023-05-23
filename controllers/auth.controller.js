const jwt = require(`jsonwebtoken`)
const md5 = require(`md5`)
const userModel = require(`../models/index`).user

exports.authentication = async (request, response) => {
    try {
        let dataLogin = {
            username: request.body.username,
            password: md5(request.body.password)
        }

        let result = await userModel.findOne({ where: dataLogin })
        if (result) {
            let secretKey = `dreamer_irzed`
            let header = {
                algorithm: "HS256"
            }
            let payload = JSON.stringify(result)
            let token = jwt.sign(payload, secretKey, header)

            return response.json({
                status: true,
                token: token,
                data:result,
                message: `login successfull`
            })
        } else {
            return response.json({
                status: false,
                message: `Invalid username or password`
            })
        }
    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        })
    }
}
exports.authorization = (request, response, next) => {
    try {
        let header = request.headers.authorization
        let tokenKey = header && header.split(" ")[1]
        if(tokenKey == null){
            return response.json({
                status: false,
                message: "Unauthorize user"
            })
        }
        let secretKey = "dreamer_irzed"
        jwt.verify(tokenKey, secretKey, header, (error, user) => {
            if(error){
                return response.json({
                    status: false,
                    message: "Invalid token"
                })
            }
        })
        next()
    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        })
    }
}