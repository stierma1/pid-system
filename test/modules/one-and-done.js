import System from "../../built/system"

export async function one(){
  var [num, returnPid] = await this.receive();
  returnPid.send(["OK", num + 1]);
}

export async function done(){
  var done = await this.receive();
  var message = await this.receive();
  done(message);
}

export async function timeout(){
  var returnPid = await this.receive();
  var message = await this.receive({timeout:100}, () => {
    returnPid.send(["ERR", "timeout"]);
    this.exit("error")
  })
  returnPid.send(["OK", message]);
}

export async function error(){
  var message = await this.receive();
  throw new Error("I errored");
}

export async function fast(){
  var [message, returnPid] = await this.receive();
  returnPid.send(message + " fast");
  this.exit()
}

export async function slow(){
  var [message, returnPid] = await this.receive();
  await new Promise(function(res){
    setTimeout(function(){res()}, 100)
  });

  returnPid.send(message + " slow");
  this.exit();
}

export async function errorD(){
  var [message, returnPid] = await this.receive();
  returnPid.send(["ERR", message + " error"]);
  this.exit()
}

export async function watch(){
  var watchPid = await this.receive();
  var returnPid = await this.receive();
  var message = await System.receiveWatch(this, [watchPid], [["error"]]);
  returnPid.send( message);
}
