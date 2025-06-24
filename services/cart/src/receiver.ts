import amqp from "amqplib";
import redis from "@/redis";

const receiveFromQueue = async (
  queue: string,
  callback: (message: string) => void
) => {
  const connection = await amqp.connect("amqp://rabbitmq");
  const channel = await connection.createChannel();

  const exchange = "order";
  await channel.assertExchange(exchange, "direct", { durable: true });

  const q = await channel.assertQueue(queue, { durable: true });

  await channel.bindQueue(q.queue, exchange, queue);

  channel.consume(
    q.queue,
    (msg) => {
      if (msg) {
        callback(msg.content.toString());
      }
    },
    { noAck: true }
  );
};

receiveFromQueue("clear-cart", (msg) => {
  console.log(`Receive from queue: clear-cart`);
  const parsedMessage = JSON.parse(msg);
  const cartSessionId = parsedMessage.cartSessionId;
  redis.del(`session:${cartSessionId}`);
  redis.del(`cart:${cartSessionId}`);
  console.log("Cart cleared");
});

// import amqp from "amqplib";
// import redis from "@/redis";

// const receiveFromQueue = async (
//   queue: string,
//   callback: (message: string) => void
// ) => {
//   while (true) {
//     try {
//       const connection = await amqp.connect("amqp://rabbitmq");
//       const channel = await connection.createChannel();

//       const exchange = "order";
//       await channel.assertExchange(exchange, "direct", { durable: true });

//       const q = await channel.assertQueue(queue, { durable: true });
//       await channel.bindQueue(q.queue, exchange, queue);

//       console.log(`📥 Listening on queue: ${queue}`);

//       channel.consume(
//         q.queue,
//         (msg) => {
//           if (msg) {
//             try {
//               callback(msg.content.toString());
//             } catch (err) {
//               console.error("❌ Callback processing failed:", err);
//             }
//           }
//         },
//         { noAck: true }
//       );

//       break; // connection successful, exit retry loop
//     } catch (err) {
//       console.error("❌ RabbitMQ connection failed, retrying in 3s...");
//       await new Promise((res) => setTimeout(res, 3000));
//     }
//   }
// };

// receiveFromQueue("clear-cart", async (msg) => {
//   console.log(`📨 Message received from 'clear-cart' queue`);
//   try {
//     const { cartSessionId } = JSON.parse(msg);
//     await redis.del(`session:${cartSessionId}`);
//     await redis.del(`cart:${cartSessionId}`);
//     console.log(`🧹 Cleared cart + session for ${cartSessionId}`);
//   } catch (err) {
//     console.error("❌ Failed to process 'clear-cart' message:", err);
//   }
// });
