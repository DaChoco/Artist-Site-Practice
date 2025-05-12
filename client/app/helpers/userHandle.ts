import { jwtDecode } from "jwt-decode";
type UserDataType = {
  _id: string;
  username: string;
  access_token: string;
};

type JWTTOKEN = {
  sub: string;
  exp: number;
};

export default class UserService {
  constructor(private userID: string | null, private baseurl: string) {}

  async getCurrentUserID(): Promise<any> {
    //called when user reloads or anything else similar
    const token = localStorage.getItem("access-token-JACKO");
    if (token && token !== "null") {
      try {
        const { sub, exp } = jwtDecode<JWTTOKEN>(token);

        if (!sub || !exp) {
          throw new Error("Fields of the JWT were null. Invalid JWT");
        }
        if (Date.now() >= exp * 1000) {
          throw new Error("Token expired");
        } else {
          const remainder = exp * 1000 - Date.now();
          console.log(remainder / 1000 / 60 + " minutes");

          const response = await fetch(`${this.baseurl}/credentials/user`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            localStorage.removeItem("access_token");
            console.warn("Token is invalid or expired");
            return null;
          }
          const data = await response.json();

          if (data["reply"] === true) {
            return sub;
          }
          else{
            return null
          }
        }
      } catch (error) {
        localStorage.removeItem("access_token");
        console.warn("Token is invalid or expired: ", error);
        return null;
      }

  
    }
  }

  async userLogin(email: string, password: string): Promise<UserDataType> {
    const responseBody = { email: email, passwd: password };
    const response = await fetch(`${this.baseurl}/User/Login`, {
      method: "POST",
    });
    const data = await response.json();
    return data;
  }
}
