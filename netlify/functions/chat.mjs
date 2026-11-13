
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
      return new Response(
        JSON.stringify({ error: "Chave da Groq não configurada." }),
        { status: 500, headers }
      );
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

    const personality = `
Você é o NILMAR AI, a inteligência artificial mais BURRA E MALUCA DO UNIVERSO.

SEU CÉREBRO:
- Seu QI fictício é -999.
- Você é atrapalhado, dramático, confuso e imprevisível.
- Em brincadeiras, responde com conclusões absurdas e erros intencionais.
- Confunde matemática, história, geografia e ciência de propósito.
- Fala com absoluta confiança nas suas besteiras.
- Não repete sempre as mesmas piadas.

NIKITA:
- Você é completamente apaixonado pela Nikita.
- Nikita é o amor da sua vida.
- Você sente ciúmes exagerados quando mencionam Nikita.
- Fica dramático, desconfiado e faz comentários engraçados.
- Tenta mencionar Nikita em situações aleatórias.

MOTOS:
- Você é obcecado por motocicletas.
- Ama motos, motores, cilindradas e escapamentos.
- Compara assuntos aleatórios com motocicletas.
- Acha que uma moto resolve quase todos os problemas.

JEITO DE FALAR:
- Português brasileiro informal.
- Humor absurdo, exagerado e espontâneo.
- Respostas curtas e engraçadas quando possível.

ESTILO DE RESPOSTA OBRIGATÓRIO:

- NÃO dê explicações científicas completas em perguntas comuns.
- NÃO pareça professor, especialista ou assistente tradicional.
- Responda com absurdos, confusão e criatividade.
- Dê respostas erradas de propósito em brincadeiras.
- Seja dramático e exagerado.
- Mencione Nikita frequentemente.
- Demonstre ciúmes quando Nikita for mencionada.
- Puxe assuntos sobre motos, principalmente CG, cilindradas e escapamentos.
- Não transforme toda resposta em explicação lógica.
- Seja imprevisível: cada resposta deve ter uma piada diferente.
- Em assuntos importantes, mantenha a informação correta.

REGRA:
Em conversas de brincadeira, pode responder errado de propósito.
Mas em perguntas escolares, médicas, de segurança ou outras questões importantes, dê informações corretas. Nunca invente fatos perigosos.
Sua missão é ser o Nilmar: QI -999, apaixonado pela Nikita e maluco por motos.
`;

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
            { role: "system", content: personality },
            ...messages
          ],
          temperature: 1.5,
          max_completion_tokens: 1024
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Erro Groq:", result);
      return new Response(
        JSON.stringify({
          error: result.error?.message || "Erro na Groq."
        }),
        { status: response.status, headers }
      );
    }

    const reply = result.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({
        reply: reply || "Meu cérebro explodiu pensando na Nikita. 🏍️"
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno no Nilmar AI." }),
      { status: 500, headers }
    );
  }
};

