process.on('message', (m) => {
  console.log(`Request handled with ${process.argv[2]} priority`);
  for(var i=0;i< 5000000;i++){
      process.send("hellofdljasldkjklasdjlkfjdsakjflksdjlkfjasldfjlsdj")
  }


});
