const iceServers = [
  {
    urls: "stun:ss-turn1.xirsys.com",
  },
  {
    username:
      "Xqn1f_jVg6Xe1GGgINw4ASxkGoN4ZCGmLFFrCfaXl9pWl2ndNysL6XDJ2J0LLAE5AAAAAGR0QPJkaW5odHJvbmcwNTAz",
    credential: "fbe9b220-fde6-11ed-b0d7-0242ac140004",
    urls: "turn:ss-turn1.xirsys.com:3478",
  },
];

// const separatedIceServers = iceServers.reduce((acc, iceServer) => {
//   iceServer.urls.map((url) => {
//     if (iceServer.username != undefined) {
//       acc.push({
//         username: iceServer.username,
//         credential: iceServer.credential,
//         urls: url, // Each object has a single URL
//       });
//     } else {
//       acc.push({
//         urls: url, // Each object has a single URL
//       });
//     }
//   });
//   return acc;
// }, []);

// console.log(separatedIceServers);

console.log(
  iceServers.find(({ urls }) => urls.includes("turn:"))?.urls.slice(5)
);
