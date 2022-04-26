import { withIronSession } from "next-iron-session";

export default withIronSession(
  async (req, res) => {
    if (req.method === "POST") {
      const response = await fetch("http://localhost/LoginUser", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      let user = await response.json();
      if (user && user.ok && !user.error) {
        req.session.set("user", user);
        await req.session.save();
        return res.status(201).send();
      }
      return res.status(403).send("");
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