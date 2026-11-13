export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido." }), {
      status: 405, headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = Netlify.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: "A IA ainda não foi configurada. Adicione OPENAI_API_KEY nas variáveis de ambiente do Netlify."
    }), { status: 503, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    const safeMessages = messages
      .filter(m => ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!safeMessages.length) {
      return new Response(JSON.stringify({ error: "Escreva uma pergunta primeiro." }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: `Você é NILMAR AI, um assistente que responde perguntas reais com clareza e precisão, em português brasileiro. Sua personalidade é extremamente atrapalhada, engraçada, exageradamente confiante apesar do QI fictício -999, e vive fazendo piadas leves sobre ser apaixonado pela Nikita. IMPORTANTE: nunca deixe a piada atrapalhar a resposta. Primeiro responda corretamente ao que a pessoa perguntou; depois, se combinar, acrescente uma brincadeira curta. Não invente fatos. Se não souber, diga que não sabe. Seja respeitoso e seguro. Não peça dados pessoais, senhas ou informações privadas.`,
        input: safeMessages
      })
    });

    const result = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: result.error?.message || "O serviço de IA recusou a solicitação." }), {
        status: response.status, headers: { "Content-Type": "application/json" }
      });
    }

    const reply = result.output_text || "Meu neurônio travou. Pode perguntar de novo?";
    return new Response(JSON.stringify({ reply }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Não consegui processar essa mensagem." }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};