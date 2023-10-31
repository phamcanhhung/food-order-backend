import { AUTH_TYPE, COOKIE, HTTP, USER_ID } from "../../constants/index.js";
import { db } from "../../utils/db.server.js";
import { USER_TABLE_NAME } from "../../constants/index.js";

export const logout = (userType) => {
  const userTableName = USER_TABLE_NAME(userType);
  return async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(HTTP.NO_CONTENT); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await db[userTableName].findFirst({
      where: {
        refreshToken,
      },
    });

    if (!foundUser) {
      res.clearCookie(AUTH_TYPE, COOKIE.CLEAR_OPTION);
      return res.sendStatus(HTTP.NO_CONTENT);
    }

    // Delete refreshToken in db
    await db[userTableName].update({
      where: {
        id: foundUser.id,
      },
      data: {
        refreshToken: null,
      },
    });
    res.clearCookie(AUTH_TYPE, COOKIE.CLEAR_OPTION);
    res.clearCookie(USER_ID, COOKIE.CLEAR_OPTION);
    res.sendStatus(HTTP.NO_CONTENT);
  };
};
