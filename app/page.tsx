import SeletorProva from "./seletordeprova";
import FormsQuestao, { Questao } from "./formulario";

interface PageProps {
  searchParams: Promise<{ ano?: string }>;
}


export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const anoSel = params.ano || "2019";


  const response = await fetch(`https://api.enem.dev/v1/exams/${anoSel}/questions/1`, { cache: 'force-cache' });
  const questao: Questao = await response.json();


  return (
    <main className="card-questao">
      <h1 style={{fontSize: '32px'}}><strong>Projeto de Computador e Sociedade</strong></h1>
      <SeletorProva anoAtual={anoSel} />

      <h1>{questao.title}</h1> 
      <p>{questao.context}</p> 
      <strong><p>{questao.alternativesIntroduction}</p></strong>
      

      <FormsQuestao questao = {questao} />
    
    
    </main>
  );
}