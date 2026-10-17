'use client';
import { useRouter } from 'next/navigation';

export default function SeletorProva({ anoAtual }: { anoAtual: string }) {
    const router = useRouter();
    function mudarProva (evento: React.ChangeEvent<HTMLSelectElement>) {
        const novoAno = evento.target.value;    
        router.push(`/?ano=${novoAno}`);
    }
    return (
        <div className='ano-selecao'>


        <label htmlFor="ano-select">Escolha o ano da prova</label>
        <select id="ano-select" value={anoAtual} onChange={mudarProva}>
        <option value="2009">ENEM 2009</option>
        <option value="2010">ENEM 2010</option>
        <option value="2011">ENEM 2011</option>
        <option value="2012">ENEM 2012</option>
        <option value="2013">ENEM 2013</option>
        <option value="2014">ENEM 2014</option>
        <option value="2015">ENEM 2015</option>
        <option value="2016">ENEM 2016</option>
        <option value="2017">ENEM 2017</option>
        <option value="2018">ENEM 2018</option>
        <option value="2019">ENEM 2019</option>
        <option value="2020">ENEM 2020</option>
        <option value="2021">ENEM 2021</option>
        <option value="2022">ENEM 2022</option>
        <option value="2023">ENEM 2023</option>
        
        </select>
        
        </div>
    );
}