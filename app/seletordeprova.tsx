
'use client';

import { useRouter } from 'next/navigation';
import type { ChangeEvent } from 'react';

interface SeletorProvaProps {
    anoAtual: string;
    areaAtual?: string;
}

const areas = [
    {
        id: 'ciencias-humanas',
        nome: 'Ciências Humanas',
        descricao: 'História, Geografia, Filosofia e Sociologia',
        icone: '🌎'
    },
    {
        id: 'linguagens',
        nome: 'Linguagens',
        descricao: 'Português, Literatura, Artes e idiomas',
        icone: '📚'
    },
    {
        id: 'matematica',
        nome: 'Matemática',
        descricao: 'Matemática e suas Tecnologias',
        icone: '📐'
    },
    {
        id: 'ciencias-natureza',
        nome: 'Ciências da Natureza',
        descricao: 'Biologia, Física e Química',
        icone: '🧪'
    }
];

export default function SeletorProva({
    anoAtual,
    areaAtual = ''
}: SeletorProvaProps) {

    const router = useRouter();

    const anos = Array.from(
        { length: 15 },
        (_, indice) => 2009 + indice
    );

    function mudarProva(
        evento: ChangeEvent<HTMLSelectElement>
    ) {
        const novoAno = evento.target.value;
        router.push(`/?ano=${novoAno}`);
    }

    function selecionarArea(area: string) {
        router.push(
            `/?ano=${anoAtual}&area=${area}&questao=1`
        );
    }

    return (
        <div className="seletor-prova">

            <div className="ano-selecao">
                <label htmlFor="ano-select">
                    Escolha o ano da prova
                </label>

                <select
                    id="ano-select"
                    value={anoAtual}
                    onChange={mudarProva}
                >
                    {anos.map((ano) => (
                        <option key={ano} value={ano}>
                            ENEM {ano}
                        </option>
                    ))}
                </select>
            </div>

            <h2 className="titulo-areas">
                Escolha a área do conhecimento
            </h2>

            <div className="grade-areas">
                {areas.map((area) => (
                    <button
                        key={area.id}
                        type="button"
                        aria-pressed={areaAtual === area.id}
                        className={
                            areaAtual === area.id
                                ? 'card-area area-ativa'
                                : 'card-area'
                        }
                        onClick={() => selecionarArea(area.id)}
                    >
                        <span className="icone-area" aria-hidden="true">
                            {area.icone}
                        </span>

                        <strong>{area.nome}</strong>

                        <small>{area.descricao}</small>
                    </button>
                ))}
            </div>

        </div>
    );
}
