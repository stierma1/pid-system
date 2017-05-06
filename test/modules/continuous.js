

export async function echo(){
  var [message, returnPid] = await this.receive();

  returnPid.send(["OK", message]);
  this.recurse(echo);
}

export async function echoError(){
  var [message, returnPid] = await this.receive();

  returnPid.send(["ERR", message]);
  this.recurse(echoError);
}

export async function _null(){
  var message = await this.receive();

  this.recurse(_null);
}
