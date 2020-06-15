const { JWT } = require('../security');

const SECRET_KEY = process.env.JWT_SECRET_KEY || '{000-1-00232-111-931313-13142-12129-24-3333}'; // TEMP
const jwt = new JWT(SECRET_KEY);

const { appTokenAttribute } = require('../config');

const attributesDict = {
  [appTokenAttribute]: 'userInfo',
  authorization: 'authorizationInfo',
};

module.exports = class AuthenticationProvider {
  constructor(authData, authenticationAttributes) {
    this.authData = authData;
    this.authenticationAttributes = authenticationAttributes;
  }

  isValid() {
    try {
      this.authenticationAttributes.forEach((attribute) => {
        const jwtToken = this.authData && this.authData[attribute];

        jwt.verify(jwtToken, SECRET_KEY);
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  getAuthorization() {
    const authorization = {};

    Object.keys(attributesDict).forEach((attribute) => {
      if (this.authData[attribute]) {
        const tokenData = jwt.decode(this.authData[attribute]);

        delete tokenData.iat;
        authorization[attributesDict[attribute]] = tokenData;
      }
    });

    return authorization;
  }
};
