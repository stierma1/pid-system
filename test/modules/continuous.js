import System from "../../built/system"

export async function echo(){
  var [message, returnPid] = await System.receive(this);

  System.send(returnPid, ["OK", message]);
  System.recurse(this, echo);
}

export async function echoError(){
  var [message, returnPid] = await System.receive(this);

  System.send(returnPid, ["ERR", message]);
  System.recurse(this, echo);
}

export async function _null(){
  var message = await System.receive(this);

  System.recurse(this, _null);
}
