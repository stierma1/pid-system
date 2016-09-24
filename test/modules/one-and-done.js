import System from "../../built/system"

export async function one(){
  var [num, returnPid] = await System.receive(this);
  System.send(returnPid, ["OK", num + 1]);
}

export async function done(){
  var done = await System.receive(this);
  var message = await System.receive(this);
  done(message);
}