
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

// Busca as questões da API e elimina registros duplicados.
async function buscarQuestoes(
  ano: string,
  area: string
): Promise<Questao[]> {

  const questoes = new Map<string, Questao>();

  const limit = 50;

  for (const offset of [0, 50, 100, 150, 200]) {

    const url = new URL(
      `https://api.enem.dev/v1/exams/${ano}/questions`
    );

    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

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
        `Erro ${response.status} ao consultar a API.`
      );
    }

    const dados = await response.json();

    if (!Array.isArray(dados.questions)) {
      throw new Error(
        "Resposta inválida da API do ENEM."
      );
    }

    const lista: Questao[] = dados.questions;

    for (const questao of lista) {

      const chave =
        `${ano}-${questao.index}-${questao.language || "sem-idioma"}`;

      if (!questoes.has(chave)) {
        questoes.set(chave, questao);
      }
    }

    if (lista.length < limit) {
      break;
    }
  }

  return Array.from(questoes.values())
    .filter((questao) => questao.discipline === area)
    .sort((a, b) => a.index - b.index);
}

export default function Home({
  searchParams
}: PageProps) {

  return (
    <main className="card-questao">

      <h1 style={{ fontSize: "32px" }}>
        <strong>
          Projeto de Computador e Sociedade
        </strong>
      </h1>

      <Suspense
        fallback={<p>Carregando plataforma...</p>}
      >
        <ConteudoProva searchParams={searchParams} />
      </Suspense>

    </main>
  );
}

async function ConteudoProva({
  searchParams
}: PageProps) {

  const params = await searchParams;

  const anoSel =
    params.ano &&
    /^(2009|201[0-9]|202[0-3])$/.test(params.ano)
      ? params.ano
      : "2019";

  const areaSel =
    params.area &&
    Object.prototype.hasOwnProperty.call(areas, params.area)
      ? params.area
      : "";

  const numeroSolicitado = Number(
    params.questao || "1"
  );

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

  function enderecoQuestao(numero: number) {

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

          <h2>Não foi possível carregar as questões</h2>

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

          <h2>Nenhuma questão encontrada</h2>

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
              style={{ width: "100%" }}
              aria-label="Posição na lista de questões"
            />

          </div>

          <h2>
            <strong>{questao.title}</strong>
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

            <p style={{ whiteSpace: "pre-wrap" }}>
              {questao.context}
            </p>

          )}

          {(questao.files || questao.file || []).map(
            (imagem, indice) => (

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

            )
          )}

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
              >
                ← Anterior
              </Link>

            ) : (

              <span>Início da lista</span>

            )}

            <span>
              {posicao} / {total}
            </span>

            {posicao < total ? (

              <Link
                className="botao-navegacao"
                href={enderecoQuestao(posicao + 1)}
              >
                Próxima →
              </Link>

            ) : (

              <span>Fim da lista</span>

            )}

          </div>

        </>

      )}

    </>
  );
}
