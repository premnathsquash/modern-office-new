
exports.check = async(ws, req) => {
  console.log("connection");
  ws.on("message", (msg) => {
    ws.send(msg);
  });
  ws.on('close', () => {
    console.log('WebSocket was closed')
})

}