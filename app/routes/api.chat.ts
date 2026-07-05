export async function action({ request }: any) {
  try {
    const { messages } = await request.json();

    const lastMessage = messages?.at(-1)?.content || "";

    return new Response(
      JSON.stringify({
        reply: `FlipTrack AI: ${lastMessage}`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        reply: "Server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}