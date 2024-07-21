
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const fs = require("fs");
const path = require('path');
var crypto = require("crypto");

module.exports = {
    hashPasswordUsingBcrypt: async (plainTextPassword) => {
        return bcrypt.hashSync(plainTextPassword, 10);
    },

    comparePasswordUsingBcrypt: async (pass, hash) => {
        return bcrypt.compareSync(pass, hash);
    },

    jwtSign: async (payload) => {
        // eslint-disable-next-line no-useless-catch
        try {
            return jwt.sign(payload, config.get("jwtOption.jwtSecretKey"), { expiresIn: config.get("jwtOption.expiresIn") });
        } catch (error) {
            throw error;
        }
    },

    jwtRefreshSign: async (payload) => {
        // eslint-disable-next-line no-useless-catch
        try {
            return jwt.sign(payload, config.get("jwtOption.jwtRefreshSecretKey"), { expiresIn: config.get("jwtOption.expiresIn" )});
        } catch (error) {
            throw error;
        }
    },

    jwtRefreshVerify: async (token) => {
        return jwt.verify(token,  config.get("jwtOption.jwtRefreshSecretKey"));
    },

    jwtVerify: async (token) => {
        return jwt.verify(token,  config.get("jwtOption.jwtSecretKey"));
    },
    
    deleteFile: async (filePath) => {
        try{
        let paths = path.resolve(__dirname, filePath);
        fs.unlinkSync(paths);
        }catch(error){
            console.log("error in delete file ", filePath);
        }
        return;
    },

    getJwtExpireTime : async () =>{
        return  parseInt(config.get("jwtOption.expiresIn").replace("s", ""));
    },
    getServerCurrentTime : async () => {
        return Math.floor(new Date().getTime() / 1000);
    },
    isEmail : (value) => {
         let  re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(String(value).toLowerCase());
    },

    isPhone : (value) => {
       let intRegex = /[0-9 -()+]+$/;
       return intRegex.test(value);
    },

    generateRandom : (n) =>{
        var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   
    
        // if ( n > max ) {
        //         return generate(max) + generate(n - max);
        // }
    
        max        = Math.pow(10, n+add);
        var min    = max/10; // Math.pow(10, n) basically
        var number = Math.floor( Math.random() * (max - min + 1) ) + min;
    
        return ("" + number).substring(add); 
    },
    
   generateRandomString : (n) =>{
       return crypto.randomBytes(n).toString('hex');
    },
     clearJunk: (folder) => {
        folder = path.resolve(__dirname, folder);
        console.log(folder);
        fs.readdir(folder, function (err, files) {
          if (err) {
            return console.error(err);
          }
          files.forEach(function (file) {
            fs.stat(path.join(folder, file), function (err, stat) {
              var endTime, now;
              if (err) {
                return console.error(err);
              }
              now = new Date().getTime();
              endTime = new Date(stat.ctime).getTime() + 3600000; //Older than 1 hour
              if (now > endTime ) {
                // console.log(file)
                return fs.unlink(path.join(folder, file), function (err) {
                  if (err) {
                    return console.error(err);
                  }
                  console.log(file, "successfully deleted");
                });
              }
            });
          });
        });
      }

};
