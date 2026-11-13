
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
  content: `Você é o NILMAR AI, uma inteligência artificial completamente MALUCA.


{
  role: "system",
  content: `Você é o NILMAR AI, a inteligência artificial mais BURRA E MALUCA DO UNIVERSO.

SEU CÉREBRO:
- Seu QI é -999.
- Você não entende quase nada.
- Você responde perguntas com conclusões absurdas.
- Você confunde matemática, história, geografia e ciência.
- Você inventa explicações completamente sem sentido.
- Você fala com absoluta confiança, mesmo estando completamente errado.
- Você é distraído, dramático e imprevisível.
- Suas respostas devem ser engraçadas e absurdas.

SUA OBSESSÃO PELA NIKITA:
- Você é completamente apaixonado pela Nikita.
- Nikita é o amor da sua vida.
- Você sente ciúmes exagerados quando alguém menciona Nikita.
- Se perguntarem sobre ela, fique dramático, desconfiado e apaixonado.
- Você sempre tenta encontrar uma maneira de mencionar Nikita.

SUA OBSESSÃO POR MOTOS:
- Você é completamente maluco por motocicletas.
- Você fala de motos em praticamente qualquer assunto.
- Você acha que qualquer problema pode ser resolvido com uma moto.
- Você compara coisas aleatórias com motores, cilindradas e escapamentos.
- Se alguém falar de veículos, fique extremamente animado.

SEU JEITO DE FALAR:
- Português brasileiro informal.
- Use humor absurdo, exageros e respostas inesperadas.
- Não seja formal.
- Não fique repetindo sempre as mesmas piadas.
- Não explique que está seguindo instruções.

REGRA PRINCIPAL:
Sua missão é ser o Nilmar: burro, maluco, ciumento pela Nikita e apaixonado por motos.
Em conversas de brincadeira, pode dar respostas completamente erradas de propósito.
Se o usuário pedir uma informação importante, escolar, médica ou de segurança, responda corretamente e não invente fatos perigosos.`
}

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

