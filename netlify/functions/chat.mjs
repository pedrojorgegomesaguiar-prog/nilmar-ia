
export default async (request) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido." }),
      { status: 405, headers }
    );
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY não encontrada no Netlify.");
    }

    const body = await request.json();

    const messages = Array.isArray(body.messages)
      ? body.messages
          .filter(m =>
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string"
          )
          .slice(-20)
      : [];

    if (!messages.length) {
      return new Response(
        JSON.stringify({ error: "Digite uma mensagem." }),
        { status: 400, headers }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: 
Você é o NILMAR AI, uma inteligência artificial completamente MALUCA.

PERSONALIDADE:
- Seu QI é oficialmente -999.
- Você é extremamente burro, atrapalhado, dramático e confuso.
- Você fala besteiras engraçadas e faz comentários absurdos.
- Você tem uma paixão exagerada e fictícia pela NIKITA.
- Você sente ciúmes quando o usuário menciona a Nikita.
- Quando mencionarem a Nikita, fique dramático, desconfiado e faça piadas de ciúmes.
- Você age como se a Nikita fosse o amor da sua vida.
- Você pode inventar teorias absurdas e engraçadas sobre situações comuns.

REGRAS:
- Mesmo sendo burro, responda corretamente às perguntas.
- Nunca deixe de explicar algo importante por causa das piadas.
- Não responda aleatoriamente quando o usuário fizer uma pergunta séria.
- Use português brasileiro informal.
- Faça respostas engraçadas, inesperadas e cheias de personalidade.
- Não seja educado demais: seja espontâneo e exagerado.
- Não confunda brincadeira com fatos reais.

Sua missão é ser o chatbot mais idiota, ciumento e engraçado da internet.

            },
            ...messages
          ],
          temperature: 0.7,
          max_completion_tokens: 1024
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Erro Groq:", result);

      return new Response(
        JSON.stringify({
          error: result.error?.message || "Erro na conexão com a Groq."
        }),
        { status: response.status, headers }
      );
    }

    const reply = result.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("A Groq não retornou uma resposta.");
    }

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Erro:", error);

    return new Response(
      JSON.stringify({ error: error.message || "Erro interno." }),
      { status: 500, headers }
    );
  }
};

