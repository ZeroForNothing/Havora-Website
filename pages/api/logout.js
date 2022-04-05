import { withIronSession } from "next-iron-session";

export default withIronSession(
  async (req, res) => {
    if (req.method === "POST") {
        req.session.set("user", null);
        await req.session.save();
        return res.status(200).send();
    }
    return res.status(404).send("");
  },
  {
    cookieName: "ZeroForNothing",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false
    },
    password: process.env.APPLICATION_SECRET
  }
);