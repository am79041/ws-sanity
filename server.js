const { WebSocketServer } = require("ws");
require("dotenv/config");

const sanityClient = require("./lib/sanityClient");
const getPostById = require("./lib/getPostById");

const wss = new WebSocketServer({
  port: process.env.PORT || 5000,
});

wss.on("connection", function (ws) {
  console.log(`connected`);

  let subscription;

  ws.onerror = function (error) {
    console.log(error);
  };

  ws.onmessage = async function (event) {
    ws.send(JSON.stringify("connected"));

    const ar = JSON.parse(event.data);
    subscription = sanityClient
      .listen(`*[_type == 'posts' && owner._ref in $ar]`, {
        ar,
      })
      .subscribe(async function (update) {
        if (!update.documentId.startsWith("drafts")) {
          const currentDocumentId = update.documentId;
          if (
            update.transition === "appear" ||
            update.transition === "update"
          ) {
            await timeout(1000);
            const curPost = await sanityClient.fetch(getPostById, {
              currentDocumentId,
            });

            const ownerInfo = await sanityClient.fetch(
              `
          *[_type == 'users' && _id == $ownerId] {
            _id, name, email, "profile_pic_url":profile_pic.asset->url
          }[0]
        `,
              {
                ownerId: curPost.owner._ref,
              }
            );
            curPost["ownerInfo"] = ownerInfo;
            curPost["transition"] = update.transition;
            console.log(curPost);
            ws.send(JSON.stringify(curPost));
          } else if (update.transition === "disappear") {
            console.log("deleting post...");
            ws.send(
              JSON.stringify({
                transition: update.transition,
                _id: currentDocumentId,
              })
            );
          }
        }
      });
  };
  ws.on("close", function () {
    console.log(`closed`);
    if (subscription) {
      subscription.unsubscribe();
    }
  });
});

const timeout = async function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
