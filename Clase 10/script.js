const filas = document.querySelector("tbody");
const texto = document.querySelector("#promedio");

    var total = 0;
    async function notas() {
        const consulta = await fetch("datos.json");
        const data = await consulta.json();
    data.forEach((d)=>{
    filas.innerHTML += `
        <tr>
            <td>${d.nombre}</td>
            <td>
                <div class="nota-con-barra">
                ${barrita(d.nota)}
                <span class="emoji">${carita(d.nota)}</span>
                </div>
            </td>
            <td></td>
        </tr>`;
        
        total += d.nota;                    
    });

        texto.innerHTML = (total/12).toFixed(2);
            }
            notas().catch((error) => console.error(error));

            function carita(n){
                var emoji;
                if(n > 5.9){
                        emoji = "😁";
                    } else if (n == 5.9){
                        emoji = "🫨";
                    } else {
                        emoji = "🥲";
                    }
                    return emoji
                }


function barrita(n) {
    let ancho = (n / 7) * 250;
    let color = "var(--colorFondo)";
    if (n < 4) color = "var(--colorFondo)";
    else if (n < 5.9) color = "var(--barritaMala)";

    return `
        <svg class="barra-svg" width="300" height="20">
            <rect width="250" height="20" fill="#b2b2bf" rx="4"/>
            <rect width="${ancho}" height="20" fill="${color}" rx="4"/>
            <text x="15%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${ancho > 50 ? '#fff' : '#000'}" font-size="12">${n}</text>
        </svg>`;
}