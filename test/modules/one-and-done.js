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

export async function timeout(){
  var returnPid = await System.receive(this);
  var message = await System.receive(this, {timeout:100}, () => {
    System.send(returnPid, ["ERR", "timeout"]);
    System.exit(this, "error")
  })
  System.send(returnPid, ["OK", message]);
}

export async function error(){
  var message = await System.receive(this);
  throw new Error("I errored");
}

export async function fast(){
  var [message, returnPid] = await System.receive(this);
  System.send(returnPid, message + " fast");
  System.exit(this)
}

export async function slow(){
  var [message, returnPid] = await System.receive(this);
  await new Promise(function(res){
    setTimeout(function(){res()}, 100)
  });

  System.send(returnPid, message + " slow");
  System.exit(this)
}

export async function errorD(){
  var [message, returnPid] = await System.receive(this);
  System.send(returnPid, ["ERR", message + " error"]);
  System.exit(this)
}

export async function watch(){
  var watchPid = await System.receive(this);
  var returnPid = await System.receive(this);
  var message = await System.receiveWatch(this, [watchPid], [["error"]]);
  System.send(returnPid, message);
}
