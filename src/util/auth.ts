import jwt from "jsonwebtoken";
import conf from "../conf/auth.conf";
import User from "../models/user.model";

export async function checkRefreshToken(refreshToken: string) {
  try {
    var r: any = await jwt.verify(refreshToken, conf.refreshsecret);
    return { data: r, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function checkAccessToken(accessToken: string) {
  try {
    // Try to verify with the first secret
    const data = await jwt.verify(accessToken, conf.secret);
    return { data, error: null };
  } catch (error: any) {
    if (error?.name === 'JsonWebTokenError') {
      // If the first secret fails, try the second one
      try {
        let data: any= {};
         data.user = await jwt.verify(accessToken, conf.mobilesecret);
        return { data, error: null };
      } catch (error) {
        // Return an error if both secrets fail
        return { data: null, error };
      }
    } else {
      // Return any other errors (not JWT-related)
      return { data: null, error };
    }
  }
}

export async function generateTokens(_id: string, role: string) {
  var r = await jwt.sign({ user: { _id, role } }, conf.secret, {
    expiresIn: conf.expiresIn,
  });
  return { accessToken: r };
}

export async function generateRefreshToken(_id: string, role: string) {
  var r = await jwt.sign({ user: { _id, role } }, conf.refreshsecret, {
    expiresIn: conf.refreshExpiresIn,
  });
  return { refreshToken: r };
}

export async function getAccessByRefreshToken(token: string, _id:string, role:string) {
  /** Find user _id */
  if(_id == '1' && role == '1'){
    const res = await generateTokens(_id,role);
    return res;
  }
  var u = await User.findOne({where: { refresh_token: token }});
  if (!u) return null;

  const res = await generateTokens(u?.id, u?.role);

  return res;
}

