const filas = document.querySelector("tbody");
var total= 0;
function carita(nota) {
    if (nota > 5.9) {
        return "😃";
    } else if (nota == 5.9) {
        return "😥";
    } else {
        return "😭";
    }
}
function barrita(n){
    let ancho= n*40;
    return ancho;
}
async function notas() {
    let consulta = await fetch("https://raw.githubusercontent.com/profesorfaco/opr/refs/heads/main/clase-08/notas.json");
    let data = await consulta.json();
    console.log(data);
    data.forEach((d)=>{
        filas.innerHTML += `<tr>
            <td>${d.nombre}</td>
            <td>
            <svg xlmns="http://www.w3.org/2000/svg" viewBox="0 0 280 30">
            <rect width="${barrita(d.nota)}" height="30" fill="${d.nota > 5.9 ? 'green' : d.nota == 5.9 ? 'yellow' : 'red'}"></rect>
            <text x="10%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${d.nota > 5.9 ? 'white' : d.nota == 5.9 ? 'black' : 'white'}">${d.nota}</text>
            </svg>
            </td>
            <td>${carita(d.nota)}</td>
        </tr>`;
        total += d.nota;
    });
    document.getElementById("promedio").innerHTML = (total/12).toFixed(1);
}
notas().catch((error) => {
    console.error("Error al cargar los datos:", error);
});