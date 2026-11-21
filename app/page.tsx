
import Link from "next/link";
import { Suspense } from "react";
import SeletorProva from "./seletordeprova";
import FormsQuestao from "./formulario";

interface Questao {
  title: string;
  index: number;
  discipline: string;
  language: string;
  year: number;
  context: string;
  files: string[] | null;
  file: string[] | null;
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: {
    letter: string;
    text: string;
    file: string | null;
    isCorrect: boolean;
  }[];
}

interface RespostaAPI {
  questions: Questao[];
  metadata: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

interface PageProps {
  searchParams: Promise<{
    ano?: string;
    area?: string;
    questao?: string;
  }>;
}

const areas: Record<string, string> = {
  "ciencias-humanas": "Ciências Humanas",
  "linguagens": "Linguagens",
  "matematica": "Matemática",
  "ciencias-natureza": "Ciências da Natureza",
};

// Classificação provisória por numeração de referência.
function classificarQuestao(
  ano: number,
  numero: number
): string {

  if (
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > 180
  ) {
    return "";
  }

  if (numero >= 136) {
    return "matematica";
  }

  if (ano === 2009) {

    if (numero <= 45) {
      return "ciencias-natureza";
    }

    if (numero <= 90) {
      return "ciencias-humanas";
    }

    return "linguagens";
  }

  if (ano >= 2010 && ano <= 2016) {

    if (numero <= 45) {
      return "ciencias-humanas";
    }

    if (numero <= 90) {
      return "ciencias-natureza";
    }

    return "linguagens";
  }

  if (ano >= 2017 && ano <= 2023) {

    if (numero <= 45) {
      return "linguagens";
    }

    if (numero <= 90) {
      return "ciencias-humanas";
    }

    return "ciencias-natureza";
  }

  return "";
}

// Busca as questões respeitando os metadados da API.
async function buscarQuestoes(
  ano: string,
  area: string
): Promise<Questao[]> {

  const questoes = new Map<string, Questao>();

  const limit = 50;

  let offset = 0;
  let temMais = true;
  let paginasConsultadas = 0;

  while (temMais) {

    // Proteção contra paginação infinita.
    if (paginasConsultadas >= 10) {
      throw new Error(
        "Não foi possível concluir a paginação da prova."
      );
    }

    const url = new URL(
      `https://api.enem.dev/v1/exams/${ano}/questions`
    );

    url.searchParams.set(
      "limit",
      String(limit)
    );

    url.searchParams.set(
      "offset",
      String(offset)
    );

    const response = await fetch(url, {
      cache: "force-cache",
    });

    if (response.status === 429) {

      throw new Error(
        "Limite de consultas atingido. Tente novamente mais tarde."
      );
    }

    if (!response.ok) {

      throw new Error(
        `Erro ${response.status} ao consultar a API do ENEM.`
      );
    }

    const dados: RespostaAPI =
      await response.json();

    if (!Array.isArray(dados.questions)) {

      throw new Error(
        "Resposta inválida da API do ENEM."
      );
    }

    if (
      !dados.metadata ||
      typeof dados.metadata.hasMore !== "boolean"
    ) {

      throw new Error(
        "Informações de paginação indisponíveis."
      );
    }

    for (const questao of dados.questions) {

      if (
        !Number.isInteger(questao.index) ||
        questao.year !== Number(ano)
      ) {
        continue;
      }

      const chave =
        `${ano}-${questao.index}-${questao.language || "sem-idioma"}`;

      if (!questoes.has(chave)) {

        questoes.set(
          chave,
          questao
        );
      }
    }

    temMais = dados.metadata.hasMore;

    paginasConsultadas++;

    if (temMais) {

      if (dados.questions.length === 0) {

        throw new Error(
          "A API retornou uma página vazia inesperadamente."
        );
      }

      // Pequena sobreposição para evitar lacunas.
      offset += 45;
    }
  }

  return Array.from(questoes.values())

    .map((questao) => ({

      ...questao,

      discipline:
        classificarQuestao(
          Number(ano),
          questao.index
        ) || questao.discipline,

    }))

    .filter(
      (questao) =>
        questao.discipline === area
    )

    .sort((a, b) => {

      return (
        a.index - b.index ||
        (a.language || "").localeCompare(
          b.language || ""
        )
      );
    });
}

export default function Home({
  searchParams,
}: PageProps) {

  return (

    <main className="card-questao">

      <h1 style={{ fontSize: "32px" }}>

        <strong>
          Projeto de Computador e Sociedade
        </strong>

      </h1>

      <Suspense
        fallback={
          <p>Carregando plataforma...</p>
        }
      >

        <ConteudoProva
          searchParams={searchParams}
        />

      </Suspense>

    </main>
  );
}

async function ConteudoProva({
  searchParams,
}: PageProps) {

  const params = await searchParams;

  const anoSel =
    params.ano &&
    /^(2009|201[0-9]|202[0-3])$/.test(params.ano)
      ? params.ano
      : "2019";

  const areaSel =
    params.area &&
    Object.prototype.hasOwnProperty.call(
      areas,
      params.area
    )
      ? params.area
      : "";

  const numeroSolicitado =
    Number(params.questao || "1");

  const numeroAtual =
    Number.isInteger(numeroSolicitado) &&
    numeroSolicitado > 0
      ? numeroSolicitado
      : 1;

  let questoes: Questao[] = [];

  let erro = "";

  if (areaSel) {

    try {

      questoes = await buscarQuestoes(
        anoSel,
        areaSel
      );

    } catch (error) {

      erro =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as questões.";
    }
  }

  const total = questoes.length;

  const posicao = Math.min(
    numeroAtual,
    Math.max(total, 1)
  );

  const questao = questoes[posicao - 1];

  const quantidadeNumeros = new Set(
    questoes.map((item) => item.index)
  ).size;

  function enderecoQuestao(
    numero: number
  ) {

    return `/?ano=${anoSel}&area=${areaSel}&questao=${numero}`;
  }

  return (

    <>

      <SeletorProva
        anoAtual={anoSel}
        areaAtual={areaSel}
      />

      {!areaSel ? (

        <div className="mensagem-inicial">

          <h2>Vamos estudar?</h2>

          <p>
            Escolha o ano da prova e uma área do
            conhecimento para começar.
          </p>

        </div>

      ) : erro ? (

        <div className="mensagem-erro">

          <h2>
            Não foi possível carregar as questões
          </h2>

          <p role="alert">
            {erro}
          </p>

          <p>
            Caso o problema persista, tente novamente
            mais tarde.
          </p>

        </div>

      ) : !questao ? (

        <div className="mensagem-inicial">

          <h2>
            Nenhuma questão encontrada
          </h2>

          <p>
            Não encontramos questões disponíveis
            para esta área e ano.
          </p>

          <p>
            Selecione outra edição ou área do
            conhecimento.
          </p>

        </div>

      ) : (

        <>

          <hr />

          <div className="cabecalho-questao">

            <h2>
              {areas[areaSel]} - ENEM {anoSel}
            </h2>

            <p>
              Questão {posicao} de {total}
            </p>

            <progress
              value={posicao}
              max={total}
              style={{
                width: "100%"
              }}
              aria-label="Posição na lista de questões"
            />

            <small>
              {quantidadeNumeros} números de questões
              disponíveis nesta área.
            </small>

            {quantidadeNumeros < 45 && (

              <p
                className="aviso-questoes"
                role="status"
              >
                Algumas questões podem não estar
                disponíveis na base de dados.
              </p>

            )}

            <small className="aviso-classificacao">
              Organização por numeração de referência.
              Classificação em validação.
            </small>

          </div>

          <h2>

            <strong>
              {questao.title}
            </strong>

          </h2>

          {questao.language && (

            <p>

              Idioma: {
                questao.language === "ingles"
                  ? "Inglês"
                  : questao.language === "espanhol"
                    ? "Espanhol"
                    : questao.language
              }

            </p>

          )}

          {questao.context && (

            <p
              className="contexto-questao"
              style={{
                whiteSpace: "pre-wrap"
              }}
            >

              {questao.context}

            </p>

          )}

          {(
            questao.files ||
            questao.file ||
            []
          ).map((imagem, indice) => (

            <img
              key={indice}
              src={imagem}
              alt={`Imagem ${indice + 1} da questão`}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "8px",
              }}
            />

          ))}

          <p>

            <strong>

              {questao.alternativesIntroduction}

            </strong>

          </p>

          <FormsQuestao
            key={`${anoSel}-${areaSel}-${questao.index}-${questao.language}`}
            questao={questao}
          />

          <div
            className="navegacao-questoes"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginTop: "20px",
            }}
          >

            {posicao > 1 ? (

              <Link
                className="botao-navegacao"
                href={enderecoQuestao(posicao - 1)}
                prefetch={false}
              >
                ← Anterior
              </Link>

            ) : (

              <span>
                Início da lista
              </span>

            )}

            <span>
              {posicao} / {total}
            </span>

            {posicao < total ? (

              <Link
                className="botao-navegacao"
                href={enderecoQuestao(posicao + 1)}
                prefetch={false}
              >
                Próxima →
              </Link>

            ) : (

              <span>
                Fim da lista
              </span>

            )}

          </div>

        </>

      )}

    </>
  );
}
