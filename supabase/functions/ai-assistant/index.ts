import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  type: 'analyze_insight' | 'improve_suggestion' | 'validate_idea' | 'sector_analysis' | 'productivity_report';
  data: {
    nomeProjeto?: string;
    descricao?: string;
    objetivoEsperado?: string;
    categoria?: string;
    tipo?: string;
    prioridade?: string;
    areaSolicitante?: string;
    kpiImpactado?: string;
    eficienciaEsperada?: string;
    demandas?: any[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CUSTOM_LLM_URL = Deno.env.get('CUSTOM_LLM_URL');
    const CUSTOM_LLM_API_KEY = Deno.env.get('CUSTOM_LLM_API_KEY');

    if (!CUSTOM_LLM_URL || !CUSTOM_LLM_API_KEY) {
      console.error('Missing LLM configuration');
      throw new Error('LLM não configurado');
    }

    const { type, data }: AIRequest = await req.json();
    console.log('AI Assistant request:', { type, data });

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'analyze_insight':
      case 'validate_idea':
        systemPrompt = `Você é um analista de demandas de TI especializado em validação de insights e solicitações.
Sua função é analisar demandas e fornecer feedback construtivo sobre:
- Clareza e completude da descrição
- Viabilidade técnica
- Alinhamento com boas práticas
- Sugestões de melhoria

Responda sempre em português brasileiro de forma objetiva e profissional.
Use formatação com markdown para organizar a resposta.`;

        userPrompt = `Analise esta demanda e forneça feedback detalhado:

**Projeto:** ${data.nomeProjeto || 'Não informado'}
**Categoria:** ${data.categoria || 'Não informada'}
**Tipo:** ${data.tipo || 'Não informado'}
**Prioridade:** ${data.prioridade || 'Não informada'}
**Área Solicitante:** ${data.areaSolicitante || 'Não informada'}

**Descrição:**
${data.descricao || 'Não informada'}

**Objetivo Esperado:**
${data.objetivoEsperado || 'Não informado'}

**KPI Impactado:** ${data.kpiImpactado || 'Não informado'}
**Eficiência Esperada:** ${data.eficienciaEsperada || 'Não informada'}

Forneça:
1. **Avaliação Geral** (nota de 1 a 5 estrelas e justificativa)
2. **Pontos Fortes** da demanda
3. **Pontos de Melhoria** que precisam de atenção
4. **Sugestões Específicas** para aprimorar a ideia
5. **Viabilidade Técnica** - se a demanda parece tecnicamente viável`;
        break;

      case 'improve_suggestion':
        systemPrompt = `Você é um especialista em redação de demandas técnicas.
Sua função é melhorar textos de demandas tornando-os mais claros, objetivos e completos.
Mantenha o sentido original mas aprimore a qualidade.
Responda sempre em português brasileiro com formatação markdown.`;

        userPrompt = `Melhore o seguinte texto de demanda:

**Descrição atual:**
${data.descricao || ''}

**Objetivo atual:**
${data.objetivoEsperado || ''}

Forneça versões melhoradas de:
1. **Descrição Melhorada** (mais clara, detalhada e estruturada)
2. **Objetivo Melhorado** (mais específico, mensurável e alcançável)
3. **Sugestões Adicionais** para enriquecer a demanda`;
        break;

      case 'sector_analysis':
        systemPrompt = `Você é um analista de produtividade empresarial.
Analise demandas de diferentes setores e identifique padrões, sinergias e oportunidades de otimização.
Responda sempre em português brasileiro com formatação markdown.`;

        userPrompt = `Analise as seguintes demandas e identifique:
1. **Padrões entre setores**
2. **Possíveis sinergias**
3. **Gargalos identificados**
4. **Recomendações de priorização**

Demandas:
${JSON.stringify(data.demandas, null, 2)}`;
        break;

      case 'productivity_report':
        systemPrompt = `Você é um consultor de produtividade e eficiência operacional.
Gere relatórios analíticos sobre demandas e ganhos de produtividade.
Responda sempre em português brasileiro com dados estruturados e formatação markdown.`;

        userPrompt = `Gere um relatório de produtividade baseado nestas demandas:
${JSON.stringify(data.demandas, null, 2)}

Inclua:
1. **Resumo Executivo**
2. **Análise de Ganhos de Eficiência**
3. **Recomendações Estratégicas**
4. **Métricas Chave**`;
        break;

      default:
        throw new Error('Tipo de análise não suportado');
    }

    // Build the API URL - check if it already ends with the path
    let apiUrl = CUSTOM_LLM_URL;
    if (!apiUrl.endsWith('/chat/completions') && !apiUrl.endsWith('/v1/chat/completions')) {
      apiUrl = apiUrl.endsWith('/') ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
    }

    console.log('Sending request to LLM API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CUSTOM_LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', response.status, errorText);
      throw new Error(`Erro na API LLM: ${response.status}`);
    }

    const result = await response.json();
    console.log('LLM response received successfully');
    
    const aiResponse = result.choices?.[0]?.message?.content || 'Não foi possível gerar uma resposta.';

    return new Response(JSON.stringify({ 
      success: true,
      response: aiResponse,
      type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
