'use client';
import { useState, FormEvent } from 'react';

interface Opcoes{
  letter: string;
  text: string;
  file: string | null;
  isCorrect: boolean;
}

interface Questao{
  title: string;
  index: number; 
  discipline: string;
  language: string;
  year: number;
  context: string;
  file: string[] | null;
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: Opcoes[];

}

export default function FormsQuestao({ questao }: { questao: Questao}) {
    const [respostaSel, setRespostaSel] = useState<string>("");
    function EscolhaResposta(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!respostaSel) {
            alert('Escolha uma resposta')
            return;
        }
        if (respostaSel === questao.correctAlternative) {
            alert(`Parabéns! Era a letra ${questao.correctAlternative} mesmo!`)
        } else {
            alert(`Poxa, a alternativa correta era a letra ${questao.correctAlternative}. Não desanima!`)
        }
    }
    return (
        <form className="form-alternativas" onSubmit={EscolhaResposta}>
    {questao.alternatives.map((alt) => (
    <div key={alt.letter} className="opcao-item">
        <input 
        type="radio"
        id={`opcao-${alt.letter}`}
        name = "resposta"
        value={alt.letter}
        onChange={(e) => setRespostaSel(e.target.value)}
        checked={respostaSel === alt.letter}
    />

    <label htmlFor={`opcao-${alt.letter}`}> 
        <strong>   {alt.letter}</strong> {alt.text}
    </label>
    </div>
    ))}
    <button type="submit">Enviar resposta</button>
</form>
    )
}
