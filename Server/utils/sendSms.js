
import fast2sms from "fast-two-sms";
import unirest  from "unirest";
export const sendSms = async (number, text) => {

//        var options = {
//             authorization: "MKt9jCx5jT3LM81c3HG23ZR7xTQYeBdf9qT9Eej3VyX1iZN1MXiZN5AWLd6s",
//             message: "text",
//             numbers: ['7058402300']
//         }
//  const res = await fast2sms.sendMessage(options);
//  console.log(res);


var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

req.headers({
  "authorization": "MKt9jCx5jT3LM81c3HG23ZR7xTQYeBdf9qT9Eej3VyX1iZN1MXiZN5AWLd6s"
});

req.form({
  "message": "hi",
  
  "numbers": "7058402300"
});

req.end(function (res) {
  if (res.error) console.log(res.error);;

  console.log(res.body);
});
    }
