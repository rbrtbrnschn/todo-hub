const { sendMail } = require("../services/nodemailer/nodemailerSetup");
const { isAuth } = require("../services/middleware");
const { isLoggedIn } = require("../services/snippets");
const router = require("express").Router();
const { uri } = require("../config");
const fetch = require("node-fetch");

const { PlayerDB, playerSchema } = require("../models/player");
const Player = PlayerDB.model("player", playerSchema);
const { UserDB, userSchema } = require("../models/user");
const User = UserDB.model("user", userSchema);
import { withAuth,withAuthRedirect, setUser } from "../services/middleware";


// get player by username
router.get("/find/:key/:value",withAuth,setUser, async (req: any, res: any) => {
  let { key, value } = req.params;
  switch (key) {
    case "username":
      key = "username_lower";
      value = value.toLowerCase();
      break;
    default:
      break;
  }
  const _player = await Player.findOne({ [key]: value });
  if (!_player) {
    return res.json({ status: 404, msg: "player not found", ok: true });
  } else {
    return res.json({ ..._player._doc, ok: true });
  }
  res.end();
});

//! get current player
router.get("/", withAuth,setUser, async (req: any, res: any) => {
  if (req.user) {
    const player = await Player.findOne({ playerID: req.user.userID });
    return res.json({ ...player._doc, ok: true });
  } else {
    return res.json({ status: 401, msg: "not logged in", ok: false });
  }
});

// create new player
router.post("/new", withAuth, setUser, async (req: any, res: any) => {
  const { userID, username } = req.body;
  const player = new Player({
    playerID: userID,
    username: username,
    username_lower: username.toLowerCase(),
    opponents: [],
    sockets: [],
    tasks: [],
    locale: "en",
  }).save((savedPlayer: any) => {
    return res.json(savedPlayer);
  });
});

// invite player
router.get(
  "/invite/:queryValue",
  withAuth,
  setUser,
  async (req: any, res: any) => {
    const queryValue = req.params.queryValue.toLowerCase();
    const queryKey = !queryValue.includes("@") ? "username_lower" : "email";
    const isUsername =
      queryKey === "username_lower"
        ? true
        : queryKey === "email"
        ? false
        : "ERROR";
    const _user = req.user;
    let _opponentPlayer = {};
    let _opponentUser = {};
    if (isUsername) {
      _opponentPlayer = await Player.findOne({ [queryKey]: queryValue });
      if (!_opponentPlayer)
        return res.json({ status: 404, msg: "player not found", ok: false });
      _opponentUser = await User.findOne({
        userID: _opponentPlayer.playerID,
      });
    } else {
      _opponentUser = await User.findOne({ [queryKey]: queryValue });
      if (!_opponentUser) {
        console.log("no existing user");
        _opponentUser = {};
        _opponentUser.email = queryValue;
      }
    }

    const body = `<style>.body {display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:"Arial"}.title {color: #363636;font-size: 2rem;font-weight: 600;line-height: 1.125;}.sub {color: #4a4a4a;font-size: 1.25rem;font-weight: 400;line-height: 1.25;}.button {background-color: white;border-color: #dbdbdb;border-width: 1px;color: #363636;cursor: pointer;justify-content: center;padding-bottom: calc(0.5em - 1px);padding-left: 1em;padding-right: 1em;padding-top: calc(0.5em - 1px);text-align: center;white-space: nowrap;}.link {text-decoration: none;color:black;}</style><div class="body"><h1 class="title">${_user.name} Invited You.</h1><h2 class="sub">Welcome to TodoHub - A Multiplayer TodoApp.</h2><button><a href=${uri.client}/api/player/invited?user=${_user.userID}&opponent=${_opponentUser.userID} class="link">Accept Invite.</a></button></div>`;

    const sendOptions = {
      to: _opponentUser.email,
      title: `${_user.name} invited you!`,
      body: body,
    };
    sendMail(sendOptions);
    return res.json({ status: 200, msg: "Found & Invited", ok: true });
  }
);

// accept invitation
router.get("/invited", withAuthRedirect, setUser, async (req, res) => {
  const { user, opponent } = req.query;
    console.log("reached endpoint")
  if(opponent === "undefined"){
    return res.redirect("/login");
    }
  const _player = await Player.findOne({ playerID: user });
  const _opponent = await Player.findOne({ playerID: opponent });
  if (req.user) {
    if (_player && _opponent) {
      const hasOpponent = _player.opponents.includes(opponent);
      const hasPlayer = _opponent.opponents.includes(user);
      if (!hasOpponent && !hasPlayer) {
        _player.opponents.push(opponent);
        _opponent.opponents.push(user);
        console.log(
          _player.username,
          "and",
          _opponent.username,
          "are now opponents."
        );

// Create Match
        const url = uri.client + "/api/match/new";
        const matchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: user, opponent: opponent }),
        };
        const response = await fetch(url, matchOptions);
        const data = await response.json();
        // check data for socket id
        console.log(data);
        const { socketID } = data;

        _player.sockets.push(socketID);
        _opponent.sockets.push(socketID);
        _player.save();
        _opponent.save();

        return res.redirect("/");
      } else {
        console.log("Already opponents");
        return res.json({
          status: 404,
          msg: "already opponents",
          ok: false,
        });
      }
    }
  } else {
    return res.json({
      status: 404,
      msg: "not logged in",
      ok: true,
      matchup: { user: user, opponent: opponent },
    });
  }
});


router.get("/update/lastlogin", async (req: any, res: any) => {
  const key = Date.now();
  const player = await Player.findOne({ playerID: req.user.userID });
  console.log(new Date(key), " updated.");
  if (player) {
    player.lastLogin = key;
    player.markModified("lastLogin");
    player.save();
    return res.json(player);
  }
  return res.end();
});

    router.post("/update/highscore",async (req:any, res: any) => {
    const highscore = req.body.highscore;
    let player = await Player.findOne({playerID:req.user.userID});
    if(player){
        player.highscore = highscore;
    	player.save()
    	return res.json(player)
    }
    else{
    	res.end().status(404);
    }
    })

module.exports = router;
